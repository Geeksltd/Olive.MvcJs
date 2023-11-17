define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionEnum = exports.AjaxState = exports.GlobalSearchFactory = void 0;
    var GlobalSearchFactory = /** @class */ (function () {
        function GlobalSearchFactory(waiting, modalHelper) {
            this.waiting = waiting;
            this.modalHelper = modalHelper;
        }
        GlobalSearchFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new GlobalSearch($(e), _this.waiting, _this.modalHelper).enable(); });
        };
        return GlobalSearchFactory;
    }());
    exports.GlobalSearchFactory = GlobalSearchFactory;
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(input, waiting, modalHelper) {
            this.input = input;
            this.waiting = waiting;
            this.isTyping = false;
            this.searchedText = null;
            this.modalHelper = modalHelper;
        }
        GlobalSearch.prototype.boldSearch = function (str, searchText) {
            if (!str)
                return "";
            return str.replace(new RegExp('(' + searchText + ')', "gi"), "<b>$1</b>");
        };
        GlobalSearch.prototype.boldSearchAll = function (str, searchText) {
            var result = str;
            if (searchText) {
                var splitedsearchtext = searchText.split(" ");
                for (var _i = 0, splitedsearchtext_1 = splitedsearchtext; _i < splitedsearchtext_1.length; _i++) {
                    var strST = splitedsearchtext_1[_i];
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        };
        GlobalSearch.prototype.enable = function () {
            var _this = this;
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
            var timeout = null;
            this.input.keyup(function (e) {
                if (e.keyCode === 27) {
                    return;
                }
                _this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    _this.isTyping = false;
                    if (_this.searchedText !== _this.input.val().trim()) {
                        _this.createSearchComponent(_this.urlList);
                    }
                }), 300);
            });
        };
        GlobalSearch.prototype.createSearchComponent = function (urls) {
            var _this = this;
            this.searchedText = this.input.val().trim();
            this.groupsPanel.empty();
            this.resultsPanel.empty();
            if (this.searchedText) {
                this.helpPanel.hide();
            }
            else {
                this.helpPanel.show();
                return;
            }
            var ajaxList = urls.map(function (p) {
                var icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon: icon,
                    state: AjaxState.pending,
                };
            });
            var context = {
                ajaxList: ajaxList,
                resultCount: 0,
                groupsPanel: this.groupsPanel,
                resultsPanel: this.resultsPanel,
                beginSearchStarted: true,
                searchedText: this.searchedText,
            };
            if (context.ajaxList.length)
                this.waiting.show();
            var _loop_1 = function (ajaxObject) {
                ajaxObject.ajx = $
                    .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: function (result) { return _this.onSuccess(ajaxObject, context, result); },
                    complete: function (jqXhr) { return _this.onComplete(context, jqXhr); },
                    error: function (jqXhr) { return _this.onError(ajaxObject, jqXhr); },
                });
            };
            for (var _i = 0, _a = context.ajaxList; _i < _a.length; _i++) {
                var ajaxObject = _a[_i];
                _loop_1(ajaxObject);
            }
        };
        GlobalSearch.prototype.onSuccess = function (sender, context, result) {
            if (this.isTyping) {
                return;
            }
            sender.result = result;
            if (result === null || result === void 0 ? void 0 : result.length) {
                sender.state = AjaxState.success;
                // Results from GlobalSearch MS have the GroupTitle in their description field separated with $$$
                var resultWithType = result.map(function (x) {
                    if (x.Description === null || x.Description.indexOf("$$$") < 0) {
                        return x;
                    }
                    var descArray = x.Description.split("$$$");
                    var groupTitle = descArray.shift();
                    x.GroupTitle = groupTitle;
                    x.Description = descArray.join("");
                    return x;
                });
                var groupedByResult = this.groupBy(resultWithType, 'GroupTitle');
                var index = 0;
                for (var item in groupedByResult) {
                    if (!groupedByResult[item].length)
                        continue;
                    this.createSearchItems(sender, context, index++, item, groupedByResult[item]);
                    if (context.beginSearchStarted && result.length > 0) {
                        context.beginSearchStarted = false;
                    }
                }
            }
            else {
                sender.state = AjaxState.failed;
                console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
            }
        };
        GlobalSearch.prototype.isValidResult = function (item, context) {
            var resfilter = false;
            if (context.searchedText) {
                var arfilter = context.searchedText.split(" ");
                for (var _i = 0, arfilter_1 = arfilter; _i < arfilter_1.length; _i++) {
                    var strfilter = arfilter_1[_i];
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
        };
        GlobalSearch.prototype.createSearchItems = function (sender, context, groupIndex, groupTitle, items) {
            var _a;
            groupTitle = groupTitle || ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ?
                items[0].GroupTitle : sender.url.split(".")[0]
                .replace("https://", "")
                .replace("http://", "")
                .replace("'", "")
                .replace("\"", "")
                .toUpperCase();
            var id = ((groupTitle || 'group').replace(/ /g, "-")) + "-" + groupIndex;
            var active = this.groupsPanel.children().length == 0 ? "active" : "";
            var searchTitle = $("<li class='nav-item'><a class='nav-link ".concat(active, "' href='#").concat(id, "' role='tab' data-toggle='tab'><i class='").concat(sender.icon, "'></i> ").concat(groupTitle || "Global", " <span class='badge badge-secondary'>").concat(items.length, "</span></a></li>"));
            // we may need to use the search title to implement show more.
            // but we may only need to add li (show more) at the end of list and after it is clicked,
            // it makes all hidden items visible
            this.groupsPanel.append(searchTitle);
            var childrenItems = $("<div class='row'>");
            var maxResultItemsCount = 100;
            for (var i = 0; i < items.length && i < maxResultItemsCount; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            childrenItems = $("<div role='tabpanel' class='tab-pane " + active + "' id='" + id + "'>").append(childrenItems);
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                childrenItems.css("color", items[0].Colour);
            }
            $(childrenItems).find("[target='$modal'][href]").off("click").click(function () {
                $('#global-search-modal').modal('hide');
            });
            this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));
            this.resultsPanel.append(childrenItems);
        };
        GlobalSearch.prototype.createItem = function (item, context) {
            var attr = "";
            if (item.Action == ActionEnum.Popup)
                attr = "target=\"$modal\"";
            else if (item.Action == ActionEnum.NewWindow)
                attr = "target=\"_blank\"";
            return $("<div class='".concat(this.resultItemClass, "'>") +
                "<div class='search-item'>" +
                "<div class='icon'>" +
                "<a name='Photo' class='profile-photo' href='".concat(item.Url, "'>") +
                (!item.IconUrl ? "<div class='icon'></div>" : this.showIcon(item)) +
                "</a>" +
                "</div>" +
                "<div class='result-item-content'>" +
                "<div class='type'><a href='".concat(item.Url, "' ").concat(attr, ">").concat(this.boldSearchAll(item.GroupTitle, context.searchedText), "</a></div>") +
                "<div class='title'><a href='".concat(item.Url, "' ").concat(attr, ">").concat(this.boldSearchAll(item.Title, context.searchedText), "</a></div>") +
                "<div class='body'><a href='".concat(item.Url, "' ").concat(attr, ">").concat(this.boldSearchAll(item.Description, context.searchedText), "</a></div>") +
                "</div>" +
                "</div>" +
                "</div>");
        };
        GlobalSearch.prototype.onComplete = function (context, jqXHR) {
            if (context.ajaxList.filter(function (p) { return p.state === 0; }).length === 0) {
                this.waiting.hide();
                if (context.resultCount === 0) {
                    context.resultsPanel.html("Nothing found");
                }
            }
        };
        GlobalSearch.prototype.onError = function (sender, jqXHR) {
            sender.state = AjaxState.failed;
            // this.resultsPanel.append($("ajax failed Loading data from source [" + sender.url + "]"));
            console.error(jqXHR);
        };
        GlobalSearch.prototype.showIcon = function (item) {
            if (item.IconUrl.indexOf("fa-") > 0) {
                return "<span class='icon-background' style='background-color: ".concat(item.Colour, "'><span class='").concat(item.IconUrl, "'></span></span>");
            }
            else {
                return "<img src='".concat(item.IconUrl, "' />");
            }
        };
        GlobalSearch.prototype.groupBy = function (array, key) {
            return array.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        return GlobalSearch;
    }());
    exports.default = GlobalSearch;
    var AjaxState;
    (function (AjaxState) {
        AjaxState[AjaxState["pending"] = 0] = "pending";
        AjaxState[AjaxState["success"] = 1] = "success";
        AjaxState[AjaxState["failed"] = 2] = "failed";
    })(AjaxState = exports.AjaxState || (exports.AjaxState = {}));
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum[ActionEnum["Redirect"] = 0] = "Redirect";
        ActionEnum[ActionEnum["Popup"] = 1] = "Popup";
        ActionEnum[ActionEnum["NewWindow"] = 2] = "NewWindow";
    })(ActionEnum = exports.ActionEnum || (exports.ActionEnum = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUdBO1FBQ0ksNkJBQW9CLE9BQWdCLEVBQVUsV0FBd0I7WUFBbEQsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3RFLENBQUM7UUFFTSxvQ0FBTSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBRUM7WUFERyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsT0FBTyxFQUFFLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBL0QsQ0FBK0QsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFDTCwwQkFBQztJQUFELENBQUMsQUFQRCxJQU9DO0lBUFksa0RBQW1CO0lBU2hDO1FBNkJJLHNCQUFvQixLQUFhLEVBQVUsT0FBZ0IsRUFBRSxXQUF3QjtZQUFqRSxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQXBCbkQsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUMxQixpQkFBWSxHQUFXLElBQUksQ0FBQztZQXFCaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFFbkMsQ0FBQztRQXBCUyxpQ0FBVSxHQUFwQixVQUFxQixHQUFXLEVBQUUsVUFBa0I7WUFDaEQsSUFBSSxDQUFDLEdBQUc7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFDcEIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFUyxvQ0FBYSxH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