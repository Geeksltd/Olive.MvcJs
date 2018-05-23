define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.input = targetInput;
        }
        GlobalSearch.enable = function (selector) {
            selector.each(function (i, e) { return new GlobalSearch($(e)).enable(); });
        };
        GlobalSearch.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-typeahead-enabled=true]"))
                return;
            else
                this.input.attr("data-typeahead-enabled", true);
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            if (this.valueField.length === 0) {
                console.log("Failed to find the value field for global-search:");
                console.log(this.input);
            }
            var urlsList = (this.input.attr("data-search-source") || '').split(";");
            this.input
                .data("selected-text", "")
                .on('input', function () { return _this.clearValue(); })
                .on("typeahead:selected", function (e, i) { return _this.itemSelected(i); })
                .typeahead(this.createTypeaheadSettings(urlsList));
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
                minLength: 2,
                delay: 300,
                limit: 30,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQXFCQztZQXBCRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUM3RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JB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