define(["require", "exports", "olive/components/form"], function (require, exports, form_1) {
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
            var url = this.input.attr("globalsearch-source") || '';
            $.ajax({
                url: url,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: function (response) {
                    var _loop_1 = function (item) {
                        postData = _this.toObject(form_1.default.getPostData(_this.input));
                        postData[_this.input.attr("name")] = "{{query}}";
                        _this.input
                            .data("selected-text", "")
                            .on('input', function () { return _this.clearValue(); })
                            .on("typeahead:selected", function (e, i) { return _this.itemSelected(i); })
                            .typeahead({
                            minLength: 1,
                            delay: 500,
                            backdrop: false,
                            emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
                            display: "Title",
                            template: "<a href=\"{{Url}}\" style=\"color: inherit;text-decoration:inherit\">\n                        <div style=\"min-width: 500px\">\n                          <img style=\"float: left; max-width: 40px; max-height: 40px\" src=\"{{IconUrl}}\" />\n                            <div style=\"margin-left: 65px\">\n                              <h5>{{Title}}</h5>\n                              <p style=\"font-size: 11px;opacity: 0.85;\">{{Description}}</p>\n                            </div>\n                          </div>\n                      </a>",
                            source: {
                                data: [{
                                        "Url": "",
                                        "Title": "",
                                        "IconUrl": "",
                                        "Description": ""
                                    }],
                                ajax: function (query) {
                                    return {
                                        type: "GET",
                                        url: item,
                                        data: postData
                                    };
                                }
                            },
                            callback: {
                                onNavigateAfter: function (node, lis, a, item, query, event) {
                                    if (~[38, 40].indexOf(event.keyCode)) {
                                        var resultList = node.closest("form").find("ul.typeahead__list"), activeLi = lis.filter("li.active"), offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;
                                        resultList.scrollTop(offsetTop);
                                    }
                                },
                                onClickAfter: function (node, a, item, event) {
                                    event.preventDefault();
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
                        });
                    };
                    var postData;
                    for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
                        var item = response_1[_i];
                        _loop_1(item);
                    }
                }
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQWdIQztZQS9HRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUM3RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JB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