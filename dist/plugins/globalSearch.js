define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.isMouseInsideSearchPanel = false;
            this.input = targetInput;
        }
        GlobalSearch.enable = function (selector) {
            selector.each(function (i, e) { return new GlobalSearch($(e)).enable(); });
        };
        GlobalSearch.prototype.enable = function () {
            //if (this.input.is("[data-typeahead-enabled=true]")) return;
            //else this.input.attr("data-typeahead-enabled", true);
            //this.input.wrap("<div class='typeahead__container'></div>");
            this.input.wrap("<div class='global-search-panel'></div>");
            //this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            var urlsList = (this.input.attr("data-search-source") || '').split(";");
            this.urlList = urlsList;
            //this.input
            //    .data("selected-text", "")
            //    .on('input', () => this.clearValue())
            //    .on("typeahead:selected", (e, i) => this.itemSelected(i))
            //    .typeahead(this.createTypeaheadSettings(urlsList));
            this.input.change((function (e) {
                this.createSearchComponent(this.urlList);
            }).bind(this));
            this.input.on("blur", (function (e) {
                if (this.isMouseInsideSearchPanel === false) {
                    this.clearSearchComponent();
                }
            }).bind(this));
            //this.createSearchComponent(urlsList);
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
            var inputholder = this.input.parent();
            var listHolder = $("<div class='global-search-result-panel'>")
                .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
            var ul = $("<ul>");
            listHolder.append(ul);
            inputholder.append(listHolder);
            var divsummary = $("<div class='summary'>").html('Please wait we are loading data...');
            listHolder.append(divsummary);
            var ajaxlist = urls.map(function (p) {
                return {
                    url: p,
                    state: 0 // 0 means pending, 1 means success, 2 means failed
                    ,
                    ajx: {} // the ajax object
                    ,
                    displayMessage: "" // message to display on summary
                    ,
                    result: {
                        Data: [{
                                Title: "",
                                Description: "",
                                IconUrl: "",
                                Url: ""
                            }],
                        TotalCount: 0,
                        StartIndex: 0,
                        Size: 0
                    }
                };
            });
            var resultcount = 0;
            for (var _i = 0, ajaxlist_1 = ajaxlist; _i < ajaxlist_1.length; _i++) {
                var tempobj = ajaxlist_1[_i];
                tempobj.ajx = $
                    .ajax({
                    dataType: "json",
                    url: tempobj.url,
                    async: true,
                    // additional data to be send 
                    data: { searcher: this.input.val(), SortExpression: '', StartIndex: 0, Size: 10 },
                    // if succesfully respond, this callback will be called
                    success: (function (result) {
                        var tpobj = this;
                        tpobj.result = result;
                        if (result.hasOwnProperty('Data') && result.hasOwnProperty('TotalCount') && result.Data !== null && result.Data !== undefined && typeof (result.Data) === typeof ([])) {
                            resultcount += result.Data.length;
                            tpobj.state = 1; // 1 -> success
                            // create UI element based on received data
                            for (var _i = 0, _a = result.Data; _i < _a.length; _i++) {
                                var item = _a[_i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                    .append($("<div class='item-div' title='Load this item from " + tpobj.url + "'>")
                                    .append($("<div class='item-icon'>").append($("<img class='icon' src='" + item.IconUrl + "'>")))
                                    .append($("<div class='item-title-wrapper'>")
                                    .append($("<div class='item-title'>").html(item.Title))
                                    .append($("<div class='item-description'>").append($("<p>").html(item.Description)))))));
                            }
                            console.log("ajax succeeded for: " + tpobj.url);
                            console.log(result);
                            console.log(tpobj);
                        }
                        else {
                            tpobj.state = 2; // 2 -> fail
                            console.log("ajax success but failed to decode the response -> wellform expcted response is like this: {Data:[{Title:'',Description:'',IconUrl:'',Url:''}] , TotalCount:number}");
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
                        if (resultcount === 0) {
                            divsummary.html('Found nothing');
                            console.log("Found nothing");
                        }
                        else {
                            divsummary.html('Total Found: ' + resultcount);
                            console.log('Total Found: ' + resultcount);
                        }
                        // put summary of alternative sources based on the result
                        for (var _i = 0, ajaxlist_2 = ajaxlist; _i < ajaxlist_2.length; _i++) {
                            var aj = ajaxlist_2[_i];
                            // if found data from that source
                            if (aj.state === 1 && aj.result.Data !== null && aj.result.Data !== undefined && aj.result.Data.length > 0) {
                                divsummary.append($("<div class='summary-element success'>")
                                    .append($("<span>").html('Showing <strong>' + aj.result.Data.length + '</strong> of <strong>' + aj.result.TotalCount + '</strong>'))
                                    .append($('<span>').html(' from: ' + aj.url)));
                            }
                            // if nothing found from that source
                            else if (aj.state === 1) {
                                divsummary.append($("<div class='summary-element warning'>").html('Found nothing from: ' + aj.url));
                            }
                            // if the source did not respond properly
                            else {
                                divsummary.append($("<div class='summary-element error'>").html('Failed to load data from : ' + aj.url));
                            }
                        }
                    }
                }).bind(tempobj));
                console.log('ajax send to: ' + tempobj.url);
            }
        };
        GlobalSearch.prototype.createTypeaheadSettings = function (urls) {
            var sources = {};
            var _loop_1 = function (url) {
                if (url.charAt(0) == '/') {
                    url = window.location.origin + url;
                }
                sources[url] = {
                    ajax: function (query) {
                        return { type: "GET", url: url + '?searcher={{query}}', xhrFields: { withCredentials: true } };
                    }
                };
            };
            for (var _i = 0, urls_1 = urls; _i < urls_1.length; _i++) {
                var url = urls_1[_i];
                _loop_1(url);
            }
            return {
                maxItem: 50,
                minLength: 2,
                delay: 300,
                dynamic: true,
                backdrop: false,
                correlativeTemplate: true,
                emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
                display: "Title",
                template: "\n                            <div class='item'>\n                              <img class=\"icon\" src=\"{{IconUrl}}\" />\n                                <div class='title-wrapper'>\n                                  <div class='title'>{{Title}}</div>\n                                  <div class='desc'>{{Description}}</div>\n                                </div>\n                              </div>\n                          ",
                href: "{{Url}}",
                source: sources,
                callback: {
                    onNavigateAfter: function (node, lis, a, item, query, event) {
                        if (~[38, 40].indexOf(event.keyCode)) {
                            var resultList = node.closest("form").find("ul.typeahead__list"), activeLi = lis.filter("li.active"), offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;
                            resultList.scrollTop(offsetTop);
                        }
                    },
                    onClickAfter: function (node, a, item, event) {
                        event.preventDefault();
                        window.location.href = item.Url;
                        $('#result-container').text('');
                    },
                    onResult: function (node, query, result, resultCount) {
                        if (query === "")
                            return;
                        var text = "";
                        if (result.length > 0 && result.length < resultCount) {
                            text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
                        }
                        else if (result.length > 0) {
                            text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
                        }
                        else {
                            text = 'No results matching "' + query + '"';
                        }
                        $('#result-container').html(text);
                    },
                    onMouseEnter: function (node, a, item, event) {
                        if (item.group === "country") {
                            $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>');
                        }
                    },
                    onMouseLeave: function (node, a, item, event) {
                        $(a).find('.flag-chart').remove();
                    }
                }
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFXSSxzQkFBWSxXQUFnQjtZQVQ1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFHMUMsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1lBT3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFOYSxtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDN0QsQ0FBQztRQU1ELDZCQUFNLEdBQU47WUFDSSw2REFBNkQ7WUFDN0QsdURBQXVEO1lBQ3ZELDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO1lBRTFELCtFQUErRTtZQUcvRSxJQUFJLFFBQVEsR0FBRyxDQUFTLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hGLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1lBQ3hCLFlBQVk7WUFDWixnQ0FBZ0M7WUFDaEMsMkNBQTJDO1lBQzNDLCtEQUErRDtZQUMvRCx5REFBeUQ7WUFDekQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FB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