define(["require", "exports", "olive/adapters/bootstrap"], function (require, exports, bootstrap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionEnum = exports.AjaxState = exports.GlobalSearchFactory = void 0;
    class GlobalSearchFactory {
        constructor(waiting, modalHelper) {
            this.waiting = waiting;
            this.modalHelper = modalHelper;
        }
        enable(selector) {
            selector.each((i, e) => new GlobalSearch($(e), this.waiting, this.modalHelper).enable());
        }
    }
    exports.GlobalSearchFactory = GlobalSearchFactory;
    class GlobalSearch {
        boldSearch(str, searchText) {
            if (!str)
                return "";
            return str.replace(new RegExp('(' + searchText + ')', "gi"), "<b>$1</b>");
        }
        boldSearchAll(str, searchText) {
            let result = str;
            if (searchText) {
                const splitedsearchtext = searchText.split(" ");
                for (const strST of splitedsearchtext) {
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        }
        constructor(input, waiting, modalHelper) {
            this.input = input;
            this.waiting = waiting;
            this.isTyping = false;
            this.searchedText = null;
            this.currentAjaxRequests = [];
            this.modalHelper = modalHelper;
        }
        enable() {
            if (this.input.is("[data-globalsearch-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-globalsearch-enabled", "true");
            }
            $('#global-search-modal').on('shown.bs.modal', function () {
                $('#global-search-modal .form-control').trigger('focus');
            });
            this.urlList = (this.input.attr("data-search-source") || "").split(";");
            this.resultItemClass = this.input.attr("data-result-item-class");
            this.panel = $("#global-search-modal .global-search-panel");
            this.helpPanel = $("#global-search-modal .global-search-help");
            this.groupsPanel = $("#global-search-modal .global-search-groups");
            this.resultsPanel = $("#global-search-modal .global-search-results");
            let timeout = null;
            this.input.on('keyup', (e) => {
                if (e.keyCode === 27)
                    return;
                this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((() => {
                    this.isTyping = false;
                    if (this.searchedText !== this.input.val().trim()) {
                        this.createSearchComponent(this.urlList);
                    }
                }), 300);
            });
        }
        createSearchComponent(urls) {
            this.searchedText = this.input.val().trim();
            for (const req of this.currentAjaxRequests) {
                req.abort();
            }
            this.currentAjaxRequests = [];
            this.groupsPanel.empty();
            this.resultsPanel.empty();
            if (this.searchedText) {
                this.helpPanel.hide();
            }
            else {
                this.helpPanel.show();
                return;
            }
            const ajaxList = urls.map((p) => {
                const icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon,
                    state: AjaxState.pending,
                };
            });
            const context = {
                ajaxList,
                resultCount: 0,
                groupsPanel: this.groupsPanel,
                resultsPanel: this.resultsPanel,
                beginSearchStarted: true,
                searchedText: this.searchedText,
            };
            if (!context.ajaxList.length) {
                this.resultsPanel.html(`<div class='global-search-no-results'>` +
                    `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                    `</div>`);
                return;
            }
            this.resultsPanel.html("<div class='global-search-loading'>Searching...</div>");
            for (const ajaxObject of context.ajaxList) {
                ajaxObject.ajx = $
                    .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: (result) => this.onSuccess(ajaxObject, context, result),
                    complete: (jqXhr) => this.onComplete(context, jqXhr),
                    error: (jqXhr) => this.onError(ajaxObject, jqXhr),
                });
                this.currentAjaxRequests.push(ajaxObject.ajx);
            }
        }
        onSuccess(sender, context, result) {
            sender.result = result;
            if (!(result === null || result === void 0 ? void 0 : result.length)) {
                sender.state = AjaxState.failed;
                console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                return;
            }
            sender.state = AjaxState.success;
            if (this.isTyping) {
                return;
            }
            // Results from GlobalSearch MS have the GroupTitle in their description field separated with $$$
            var resultWithType = result.map(x => {
                if (x.Description === null || x.Description.indexOf("$$$") < 0) {
                    return x;
                }
                var descArray = x.Description.split("$$$");
                var groupTitle = descArray.shift();
                x.GroupTitle = groupTitle;
                x.Description = descArray.join("");
                return x;
            });
            const groupedByResult = this.groupBy(resultWithType, 'GroupTitle');
            let index = 0;
            for (let item in groupedByResult) {
                if (!groupedByResult[item].length)
                    continue;
                this.createSearchItems(sender, context, index++, item, groupedByResult[item]);
                if (context.beginSearchStarted && result.length > 0) {
                    context.beginSearchStarted = false;
                }
            }
        }
        isValidResult(item, context) {
            let resfilter = false;
            if (context.searchedText) {
                const arfilter = context.searchedText.split(" ");
                for (const strfilter of arfilter) {
                    if (((item.Description !== null &&
                        item.Description !== undefined &&
                        item.Description.match(new RegExp(strfilter, "gi")) !== null) ||
                        item.Title.match(new RegExp(strfilter, "gi")) !== null)) {
                        resfilter = true;
                        break;
                    }
                }
            }
            else {
                resfilter = true;
            }
            return resfilter;
        }
        createSearchItems(sender, context, groupIndex, groupTitle, items) {
            var _a;
            groupTitle = groupTitle || ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ?
                items[0].GroupTitle : sender.url.split(".")[0]
                .replace("https://", "")
                .replace("http://", "")
                .replace("'", "")
                .replace("\"", "")
                .toUpperCase();
            const id = this.safeId(groupTitle || 'group') + "-" + groupIndex;
            const active = this.groupsPanel.children().length == 0 ? "active" : "";
            const searchTitle = $(`<li class='nav-item'><a class='nav-link ${active}' href='#${id}' role='tab' data-bs-toggle='tab'><i class='${sender.icon}'></i> ${groupTitle || "Global"} <span class='badge bg-secondary'>${items.length}</span></a></li>`);
            // we may need to use the search title to implement show more.
            // but we may only need to add li (show more) at the end of list and after it is clicked,
            // it makes all hidden items visible
            this.groupsPanel.append(searchTitle);
            let childrenItems = $("<div class='row'>");
            const maxResultItemsCount = 100;
            for (let i = 0; i < items.length && i < maxResultItemsCount; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            childrenItems = $("<div role='tabpanel' class='tab-pane " + active + "' id='" + id + "'>").append(childrenItems);
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                childrenItems.css("color", items[0].Colour);
            }
            $(childrenItems).find("[target='$modal'][href]").off("click").on("click", function () {
                bootstrap_1.default.hideModal($('#global-search-modal'));
            });
            this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));
            this.resultsPanel.append(childrenItems);
        }
        safeId(title) {
            return title.replace(/[^a-zA-Z0-9]/g, '_');
        }
        createItem(item, context) {
            var attr = "";
            if (item.Action == ActionEnum.Popup)
                attr = "target=\"$modal\"";
            else if (item.Action == ActionEnum.NewWindow)
                attr = "target=\"_blank\"";
            return $(`<div class='${this.resultItemClass}'>` +
                `<div class='search-item'>` +
                `<div class='icon'>` +
                `<a name='Photo' class='profile-photo' href='${item.Url}'>` +
                (!item.IconUrl ? "<div class='icon'></div>" : this.showIcon(item)) +
                `</a>` +
                `</div>` +
                `<div class='result-item-content'>` +
                `<div class='type'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.GroupTitle, context.searchedText)}</a></div>` +
                `<div class='title'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Title, context.searchedText)}</a></div>` +
                `<div class='body'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Description, context.searchedText)}</a></div>` +
                `</div>` +
                `</div>` +
                `</div>`);
        }
        onComplete(context, jqXHR) {
            if (context.ajaxList.filter((p) => p.state === 0).length === 0) {
                context.resultsPanel.find('.global-search-loading').remove();
                if (context.resultCount === 0) {
                    context.resultsPanel.html(`<div class='global-search-no-results'>` +
                        `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                        `</div>`);
                }
            }
        }
        onError(sender, jqXHR) {
            sender.state = AjaxState.failed;
            // this.resultsPanel.append($("ajax failed Loading data from source [" + sender.url + "]"));
            console.error(jqXHR);
        }
        showIcon(item) {
            if (item.IconUrl.indexOf("fa-") > 0) {
                return `<span class='icon-background' style='background-color: ${item.Colour}'><span class='${item.IconUrl}'></span></span>`;
            }
            else {
                return `<img src='${item.IconUrl}' />`;
            }
        }
        groupBy(array, key) {
            return array.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }
    }
    exports.default = GlobalSearch;
    var AjaxState;
    (function (AjaxState) {
        AjaxState[AjaxState["pending"] = 0] = "pending";
        AjaxState[AjaxState["success"] = 1] = "success";
        AjaxState[AjaxState["failed"] = 2] = "failed";
    })(AjaxState || (exports.AjaxState = AjaxState = {}));
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum[ActionEnum["Redirect"] = 0] = "Redirect";
        ActionEnum[ActionEnum["Popup"] = 1] = "Popup";
        ActionEnum[ActionEnum["NewWindow"] = 2] = "NewWindow";
    })(ActionEnum || (exports.ActionEnum = ActionEnum = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFJQSxNQUFhLG1CQUFtQjtRQUM1QixZQUFvQixPQUFnQixFQUFVLFdBQXdCO1lBQWxELFlBQU8sR0FBUCxPQUFPLENBQVM7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUN0RSxDQUFDO1FBRU0sTUFBTSxDQUFDLFFBQWdCO1lBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM3RixDQUFDO0tBQ0o7SUFQRCxrREFPQztJQUVELE1BQXFCLFlBQVk7UUFjbkIsVUFBVSxDQUFDLEdBQVcsRUFBRSxVQUFrQjtZQUNoRCxJQUFJLENBQUMsR0FBRztnQkFBRSxPQUFPLEVBQUUsQ0FBQztZQUNwQixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxHQUFHLFVBQVUsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVTLGFBQWEsQ0FBQyxHQUFXLEVBQUUsVUFBa0I7WUFDbkQsSUFBSSxNQUFNLEdBQVcsR0FBRyxDQUFDO1lBQ3pCLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoRCxLQUFLLE1BQU0sS0FBSyxJQUFJLGlCQUFpQixFQUFFLENBQUM7b0JBQ3BDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxLQUFL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