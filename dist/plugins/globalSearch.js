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
        GlobalSearch.prototype.enable = function () {
            if (this.input.is("[data-globalsearch-enabled=true]"))
                return;
            else
                this.input.attr("data-globalsearch-enabled", true);
            this.input.wrap("<div class='global-search-panel'></div>");
            var urlsList = (this.input.attr("data-search-source") || '').split(";");
            this.urlList = urlsList;
            this.input.keydown((function (e) {
                this.createSearchComponent(this.urlList);
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
                            resultcount += result.length;
                            tpobj.state = 1; // 1 -> success
                            // create UI element based on received data
                            for (var i = 0; i < result.length && i < 20; i++) {
                                var item = result[i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                    .append($("<div class='item'>")
                                    .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<span>") : $("<img class='icon' src='" + item.IconUrl + "'>"))
                                    .append($("<div class='title-wrapper'>")
                                    .append($("<div class='title'>").html(item.Title)) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>')))
                                    .append($(" <div class='desc'>").html(item.Description)) //.replace(new RegExp(tpobj.text, 'gi'), '<strong>' + tpobj.text + '</strong>'))
                                ))));
                            }
                            console.log("ajax succeeded for: " + tpobj.url);
                            console.log(result);
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
                        if (resultcount === 0) {
                            divsummary.html('Found nothing');
                            console.log("Found nothing");
                        }
                        else {
                            divsummary.empty();
                            //divsummary.html('Total Found: ' + resultcount);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFZSSxzQkFBWSxXQUFnQjtZQVY1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFFMUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFeEIsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1lBT3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFOYSxtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDN0QsQ0FBQztRQU1ELDZCQUFNLEdBQU47WUFDSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGtDQUFrQyxDQUFDO2dCQUFFLE9BQU87O2dCQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1lBRTNELElBQUksUUFBUSxHQUFHLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENB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