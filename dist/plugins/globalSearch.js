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
                console.log("Failed to find the value field for auto-complete:");
                console.log(this.input);
            }
            var urlsList = this.input.attr("data-search-source") || '';
            this.input
                .data("selected-text", "")
                .on('input', function () { return _this.clearValue(); })
                .on("typeahead:selected", function (e, i) { return _this.itemSelected(i); })
                .typeahead(this.createTypeaheadSettings(urlsList.split(';')));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQWtCQztZQWpCRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDO2dCQUFFLE9BQU87O2dCQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDN0UsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztnQkFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7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