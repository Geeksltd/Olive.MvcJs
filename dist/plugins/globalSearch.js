define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.testvarable = 3;
            this.isMouseInsideSearchPanel = false;
            this.input = targetInput;
        }
        GlobalSearch.enable = function (selector) {
            selector.each(function (i, e) { return new GlobalSearch($(e)).enable(); });
        };
        GlobalSearch.boldSearch = function (str, searchText) {
            var ix = -1;
            var result = "";
            if (str !== null && str !== undefined) {
                var strlower = str.toLowerCase();
                var stxt = searchText.toLowerCase();
                if (searchText !== "" && searchText !== null && searchText !== undefined) {
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
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    this.createSearchComponent(this.urlList);
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
            this.clearSearchComponent();
            var searchPanel = this.input.parent();
            var resultPanel = $("<div class='global-search-result-panel'>")
                .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
            var ul = $("<ul>");
            // loading icon
            if ($(".global-search-panel .loading-div").length > 0) {
                $(".global-search-panel .loading-div").empty();
                $(".global-search-panel .loading-div").remove();
            }
            $(".global-search-panel").append($("<div class='loading-div'>")
                .append($("<i class= 'loading-icon fa fa-spinner fa-spin' > </i><div>")));
            //resultPanel.append(ul);
            searchPanel.append(resultPanel);
            //var divsummary = $("<div class='summary'>").html('loading data...');        
            //resultPanel.append(divsummary);
            var ajaxlist = urls.map(function (p) {
                return {
                    url: p,
                    clearPanelMethod: _this.clearSearchComponent,
                    resultPanelElement: resultPanel,
                    searchPanelElement: searchPanel,
                    ulElement: ul,
                    text: _this.input.val(),
                    state: 0 // 0 means pending, 1 means success, 2 means failed
                    ,
                    ajx: {} // the ajax object
                    ,
                    displayMessage: "" // message to display on summary
                    ,
                    result: [{
                            Title: "",
                            Description: "",
                            IconUrl: "",
                            Url: ""
                        }]
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
                        tpobj.result = result;
                        if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                            tpobj.state = 1; // 1 -> success
                            // filter in client side
                            var resultfiltered = result.filter(function (p) { return (p.Description !== null && p.Description !== undefined && p.Description.match(new RegExp(tpobj.text, 'gi'))) || p.Title.match(new RegExp(tpobj.text, 'gi')); });
                            // create UI element based on received data
                            for (var i = 0; i < resultfiltered.length && i < 20; i++) {
                                resultcount++;
                                var item = resultfiltered[i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                    .append($("<div class='item'>")
                                    .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                    .append($("<div class='title-wrapper'>")
                                    .append($("<div class='title'>").html(GlobalSearch.boldSearch(item.Title, tpobj.text))) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>')))
                                    .append($(" <div class='desc'>").html(GlobalSearch.boldSearch(item.Description, tpobj.text))) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>'))
                                ))));
                            }
                            console.log("ajax succeeded for: " + tpobj.url);
                            console.log(resultfiltered);
                            console.log(tpobj);
                        }
                        else {
                            tpobj.state = 2; // 2 -> fail
                            console.log("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                            console.log(result);
                        }
                    }).bind(tempobj)
                })
                    // if failed to get data run this callback
                    .fail((function (e) {
                    var tpobj = this;
                    tpobj.state = 2;
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
                        //tempobj.clearPanelMethod()
                        $(".global-search-panel .loading-div").empty();
                        $(".global-search-panel .loading-div").remove();
                        resultPanel.hide();
                        resultPanel.empty();
                        if (resultcount === 0) {
                            resultPanel.append($("<div class='summary'>").html('Found nothing'));
                            console.log("Found nothing");
                        }
                        else {
                            resultPanel.append(ul);
                            console.log('Total Found: ' + resultcount);
                        }
                        resultPanel.slideDown();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFpQ0ksc0JBQVksV0FBZ0I7WUEvQjVCLGtDQUE2QixHQUFXLENBQUMsQ0FBQztZQUUxQyxnQkFBVyxHQUFXLENBQUMsQ0FBQztZQUV4Qiw2QkFBd0IsR0FBWSxLQUFLLENBQUM7WUE0QnRDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUEzQmEsbUJBQU0sR0FBcEIsVUFBcUIsUUFBZ0I7WUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFYSx1QkFBVSxHQUF4QixVQUF5QixHQUFXLEVBQUUsVUFBa0I7WUFDcEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7WUFDeEIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQyxJQUFJLFVBQVUsS0FBSyxFQUFFLElBQUksVUFBVSxLQUFLLElBQUksSUFBSSxVQUFVLEtBQUssU0FBUyxFQUFFO29CQUN0RSxHQUFHO3dCQUNDLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUN6QyxJQUFJLE9BQU8sR0FBRyxDQUFDOzRCQUNYLE1BQU07d0JBQ1Ys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