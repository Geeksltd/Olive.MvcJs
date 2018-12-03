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
                str = str
                    .replace(/<strong>/gi, '↨↨').replace(/<\/strong>/gi, '↑↑')
                    .replace(/<contact>/gi, '☺☺').replace(/<\/contact>/gi, '☻☻')
                    .replace(/<user>/gi, '♥♥').replace(/<\/user>/gi, '♦♦')
                    .replace(/<project>/gi, '♣♣').replace(/<\/project>/gi, '♠♠')
                    .replace(/<candidate>/gi, '••').replace(/<\/candidate>/gi, '◘◘')
                    .replace(/<employee>/gi, '○○').replace(/<\/employee>/gi, '◙◙')
                    .replace(/<lead>/gi, '♂♂').replace(/<\/lead>/gi, '♀♀')
                    .replace(/<test>/gi, '♪♪').replace(/<\/test>/gi, '♫♫')
                    .replace(/<account>/gi, '☼☼').replace(/<\/account>/gi, '►►')
                    .replace(/<know>/gi, '◄◄').replace(/<\/know>/gi, '↕↕')
                    .replace(/<span class='clarify'>/gi, '‼‼').replace(/<span class="clarify">/gi, '‼‼').replace(/<\/span>/gi, '¶¶')
                    .replace(/<casestudy>/gi, '§§').replace(/<\/casestudy>/gi, '▬▬');
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
                //result = result.replace(/♦♦♦♦♦♦♦♦/gi, '<strong>').replace(/♣♣♣♣♣♣♣♣/gi, '</strong>');
                result = result
                    .replace(/↨↨/gi, '<strong>').replace(/↑↑/gi, '</strong>')
                    .replace(/☺☺/gi, '<contact>').replace(/☻☻/gi, '</contact>')
                    .replace(/♥♥/gi, '<user>').replace(/♦♦/gi, '</user>')
                    .replace(/♣♣/gi, '<project>').replace(/♠♠/gi, '</project>')
                    .replace(/••/gi, '<candidate>').replace(/◘◘/gi, '</candidate>')
                    .replace(/○○/gi, '<employee>').replace(/◙◙/gi, '</employee>')
                    .replace(/♂♂/gi, '<lead>').replace(/♀♀/gi, '</lead>')
                    .replace(/♪♪/gi, '<test>').replace(/♫♫/gi, '</test>')
                    .replace(/☼☼/gi, '<account>').replace(/►►/gi, '</account>')
                    .replace(/◄◄/gi, '<know>').replace(/↕↕/gi, '</know>')
                    .replace(/‼‼/gi, '<span class="clarify">').replace(/¶¶/gi, '</span>')
                    .replace(/§§/gi, '<casestudy>').replace(/▬▬/gi, '</casestudy>');
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
                    text: _this.input.val().trim(),
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
                            // create UI element based on received data
                            for (var i = 0; i < resultfiltered.length && i < 20; i++) {
                                resultcount++;
                                var item = resultfiltered[i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                    .append($("<div class='item'>")
                                    .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
                                    .append($("<div class='title-wrapper'>")
                                    .append($("<div class='title'>").html(GlobalSearch.boldSearchAll(item.Title, tpobj.text))) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>')))
                                    .append($(" <div class='desc'>").html(GlobalSearch.boldSearchAll(item.Description, tpobj.text))) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>'))
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
                        //resultPanel.hide();
                        resultPanel.empty();
                        if (resultcount === 0) {
                            resultPanel.append($("<div class='summary'>").html('Found nothing'));
                            console.log("Found nothing");
                        }
                        else {
                            resultPanel.append(ul);
                            console.log('Total Found: ' + resultcount);
                        }
                        //resultPanel.slideDown();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUF3RUksc0JBQVksV0FBZ0I7WUF0RTVCLGtDQUE2QixHQUFXLENBQUMsQ0FBQztZQUUxQyxnQkFBVyxHQUFXLENBQUMsQ0FBQztZQUV4Qiw2QkFBd0IsR0FBWSxLQUFLLENBQUM7WUFtRXRDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFsRWEsbUJBQU0sR0FBcEIsVUFBcUIsUUFBZ0I7WUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFYSx1QkFBVSxHQUF4QixVQUF5QixHQUFXLEVBQUUsVUFBa0I7WUFDcEQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLE1BQU0sR0FBVyxFQUFFLENBQUM7WUFDeEIsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25DLEdBQUcsR0FBRyxHQUFHO3FCQUNKLE9BQU8sQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUM7cUJBQ3pELE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUM7cUJBQzNELE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUM7cUJBQ3JELE9BQU8sQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFD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