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
            var inputholder = this.input.parent();
            var listHolder = $("<div class='global-search-result-panel'>")
                .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
            var ul = $("<ul>");
            listHolder.append(ul);
            inputholder.append(listHolder);
            var divsummary = $("<div class='summary'>").html('loading data...');
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
                            tpobj.state = 1; // 1 -> success
                            // filter in client side
                            result = result.filter(function (p) { return p.Title.match(new RegExp(tpobj.text, 'gi')); });
                            // create UI element based on received data
                            for (var i = 0; i < result.length && i < 20; i++) {
                                resultcount++;
                                var item = result[i];
                                ul.append($("<li>")
                                    .append($("<a href='" + item.Url + "'>")
                                    .append($("<div class='item'>")
                                    .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>")))
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
                            divsummary.remove();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFZSSxzQkFBWSxXQUFnQjtZQVY1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFFMUMsZ0JBQVcsR0FBVyxDQUFDLENBQUM7WUFFeEIsNkJBQXdCLEdBQVksS0FBSyxDQUFDO1lBT3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFOYSxtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDN0QsQ0FBQztRQU1ELDZCQUFNLEdBQU47WUFDSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGtDQUFrQyxDQUFDO2dCQUFFLE9BQU87O2dCQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1lBRTNELElBQUksUUFBUSxHQUFHLENBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFFeEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUN6QixZQUFZLENBQUMsT0FB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