define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.testvarable = 3;
            this.isMouseInsideSearchPanel = false;
            this.isTyping = false;
            this.searchedText = null;
            this.input = targetInput;
        }
        GlobalSearch.enable = function (selector) {
            selector.each(function (i, e) { return new GlobalSearch($(e)).enable(); });
        };
        GlobalSearch.boldSearch = function (str, searchText) {
            var ix = -1;
            var result = "";
            if (str !== null && str !== undefined) {
                str = str
                    .replace(/<strong>/gi, '↨↨').replace(/<\/strong>/gi, '↑↑');
                var strlower = str.toLowerCase();
                if (searchText !== "" && searchText !== null && searchText !== undefined) {
                    var stxt = searchText.toLowerCase();
                    do {
                        var ix_next = strlower.indexOf(stxt, ix);
                        if (ix_next < 0)
                            break;
                        if (ix < 0)
                            result = str.substr(0, ix_next);
                        result += (ix >= 0 ? str.substr(ix, ix_next - ix) : "") + "<strong>" + str.substr(ix_next, stxt.length) + "</strong>";
                        ix = ix_next + stxt.length;
                    } while (true);
                }
                result += (ix < 0 ? str : str.substr(ix, str.length - ix));
                result = result
                    .replace(/↨↨/gi, '<strong>').replace(/↑↑/gi, '</strong>');
            }
            return result;
        };
        GlobalSearch.boldSearchAll = function (str, searchText) {
            var result = str;
            if (searchText != null && searchText != undefined) {
                var splitedsearchtext = searchText.split(' ');
                for (var _i = 0, splitedsearchtext_1 = splitedsearchtext; _i < splitedsearchtext_1.length; _i++) {
                    var strST = splitedsearchtext_1[_i];
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        };
        GlobalSearch.prototype.enable = function () {
            if (this.input.is("[data-globalsearch-enabled=true]"))
                return;
            else
                this.input.attr("data-globalsearch-enabled", true);
            this.input.wrap("<div class='global-search-panel'></div>");
            var urlsList = (this.input.attr("data-search-source") || '').split(";");
            this.urlList = urlsList;
            var timeout = null;
            this.input.keyup((function (e) {
                this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    this.isTyping = false;
                    if (this.searchedText != this.input.val().trim()) {
                        this.createSearchComponent(this.urlList);
                    }
                }).bind(this), 300);
            }).bind(this));
            this.input.on("blur", (function (e) {
                if (this.isMouseInsideSearchPanel === false) {
                    this.clearSearchComponent();
                }
            }).bind(this));
        };
        GlobalSearch.prototype.inputChangeHandler = function () {
            this.createSearchComponent(this.urlList);
        };
        GlobalSearch.prototype.clearSearchComponent = function () {
            var inputholder = this.input.parent();
            if (inputholder !== undefined) {
                var panel = inputholder.find(".global-search-result-panel");
                if (panel !== undefined) {
                    panel.empty();
                    panel.remove();
                }
            }
        };
        GlobalSearch.prototype.createSearchComponent = function (urls) {
            var _this = this;
            this.searchedText = this.input.val().trim();
            var searchPanel = this.input.parent();
            var resultPanel = searchPanel.find(".global-search-result-panel");
            if (resultPanel == undefined || resultPanel == null || resultPanel.length == 0) {
                resultPanel = $("<div class='global-search-result-panel'>")
                    .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                    .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
                searchPanel.append(resultPanel);
            }
            resultPanel.empty();
            var beginSearchStarted = true;
            var searchHolder = $("<div class='search-container'>");
            // loading icon
            if ($(".global-search-panel .loading-div").length > 0) {
                $(".global-search-panel .loading-div").empty();
                $(".global-search-panel .loading-div").remove();
            }
            $(".global-search-panel").append($("<div class='loading-div'>")
                .append($("<i class= 'loading-icon fa fa-spinner fa-spin' > </i><div>")));
            var ajaxlist = urls.map(function (p) {
                var icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon: icon,
                    globalsearchRef: _this,
                    text: _this.searchedText,
                    state: 0,
                    ajx: {},
                    displayMessage: "",
                    result: [{
                            Title: "",
                            Description: "",
                            IconUrl: "",
                            Url: ""
                        }],
                    template: jQuery
                };
            });
            var resultcount = 0;
            for (var _i = 0, ajaxlist_1 = ajaxlist; _i < ajaxlist_1.length; _i++) {
                var tempobj = ajaxlist_1[_i];
                tempobj.ajx = $
                    .ajax({
                    dataType: "json",
                    url: tempobj.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    // additional data to be send 
                    data: { searcher: tempobj.text },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        var tpobj = this;
                        if (tpobj.globalsearchRef.isTyping == false) {
                            tpobj.result = result;
                            if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                                tpobj.state = 1; // 1 -> success                           
                                // filter in client side                           
                                var resultfiltered = result.filter(function (p) {
                                    var resfilter = false;
                                    if (tpobj.text != null && tpobj.text != undefined && tpobj.text !== '') {
                                        var arfilter = tpobj.text.split(' ');
                                        for (var _i = 0, arfilter_1 = arfilter; _i < arfilter_1.length; _i++) {
                                            var strfilter = arfilter_1[_i];
                                            if (((p.Description !== null && p.Description !== undefined && p.Description.match(new RegExp(strfilter, 'gi')) != null) || p.Title.match(new RegExp(strfilter, 'gi')) != null)) {
                                                resfilter = true;
                                                break;
                                            }
                                        }
                                    }
                                    else {
                                        resfilter = true;
                                    }
                                    return resfilter;
                                });
                                var searchItem = $("<div class='search-item'>");
                                var groupTitle = tpobj.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();
                                var searhTitle = $("<div class='search-title'>").append($("<i>").attr("class", tpobj.icon)).append(groupTitle);
                                searchItem.append(searhTitle);
                                var childrenItems = $("<ul>");
                                for (var i = 0; i < resultfiltered.length && i < 10; i++) {
                                    resultcount++;
                                    var item = resultfiltered[i];
                                    childrenItems.append($("<li>")
                                        .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                        .append($("<a href='" + item.Url + "'>")
                                        .html(GlobalSearch.boldSearchAll(item.Title, tpobj.text)))
                                        .append($(" <div class='desc'>").html(item.Description)));
                                }
                                searchItem.append(childrenItems);
                                if (resultfiltered.length === 0)
                                    searchItem.addClass("d-none");
                                searchHolder.append(searchItem);
                                if (beginSearchStarted && resultfiltered.length > 0) {
                                    beginSearchStarted = false;
                                    resultPanel.append(searchHolder);
                                }
                            }
                            else {
                                tpobj.state = 2; // 2 -> fail
                                console.log("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                            }
                        }
                    }).bind(tempobj)
                })
                    // if failed to get data run this callback
                    .fail((function (e) {
                    var tpobj = this;
                    tpobj.state = 2;
                    var ulFail = $("<ul>");
                    ulFail.append($("<li>").append($("<span>").html('ajax failed Loading data from source [' + tpobj.url + ']')));
                    resultPanel.append(ulFail);
                    console.log('ajax failed Loading data from source [' + tpobj.url + ']');
                    console.log(e);
                }).bind(tempobj))
                    // use this callback to check whether all ajax requests, finished
                    .always((function () {
                    var tpobj = this;
                    console.log('always event raised for: ' + tpobj.url);
                    // check all ajax finished            
                    if (ajaxlist.filter(function (p) { return p.state === 0; }).length === 0) {
                        console.log('All ajax completed');
                        $(".global-search-panel .loading-div").empty();
                        $(".global-search-panel .loading-div").remove();
                        if (resultcount === 0) {
                            console.log("Found nothing");
                            var ulNothing = $("<ul>");
                            ulNothing.append("<li>").append("<span>").html('Nothing found');
                            resultPanel.append(ulNothing);
                        }
                        else {
                            console.log('Total Found: ' + resultcount);
                        }
                    }
                }).bind(tempobj));
                console.log('ajax send to: ' + tempobj.url);
            }
        };
        GlobalSearch.prototype.clearValue = function () {
            if (this.input.val() === "")
                this.valueField.val("");
            if (this.input.val() !== this.input.data("selected-text"))
                this.valueField.val("");
        };
        GlobalSearch.prototype.itemSelected = function (item) {
            if (item != undefined) {
                this.valueField.val(item.Value);
                this.input.data("selected-text", item.Display);
                this.input.val(item.Display);
            }
            else {
                console.log("Clearing text, item is undefined");
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            this.input.trigger("change");
        };
        // Convert current form array to simple plain object
        GlobalSearch.prototype.toObject = function (arr) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i)
                rv[arr[i].name] = arr[i].value;
            return rv;
        };
        return GlobalSearch;
    }());
    exports.default = GlobalSearch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQ0E7UUFrREksc0JBQVksV0FBZ0I7WUFoRDVCLGtDQUE2QixHQUFXLENBQUMsQ0FBQztZQUUxQyxnQkFBVyxHQUFXLENBQUMsQ0FBQztZQUV4Qiw2QkFBd0IsR0FBWSxLQUFLLENBQUM7WUFDMUMsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUMxQixpQkFBWSxHQUFXLElBQUksQ0FBQztZQTJDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQTFDYSxtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVhLHVCQUFVLEdBQXhCLFVBQXlCLEdBQVcsRUFBRSxVQUFrQjtZQUNwRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNaLElBQUksTUFBTSxHQUFXLEVBQUUsQ0FBQztZQUN4QixJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDbkMsR0FBRyxHQUFHLEdBQUc7cUJBQ0osT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMvRCxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksVUFBVSxLQUFLLEVBQUUsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7b0JBQ3RFLElBQUksSUFBSSxH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