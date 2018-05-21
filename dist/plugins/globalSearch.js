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
                            template: "<a href=\"{{Url}}\" style=\"color: inherit;text-decoration:inherit\">\n                        <div class='item'>\n                          <img class=\"icon\" src=\"{{IconUrl}}\" />\n                            <div class='title-wrapper'>\n                              <div class='title'>{{Title}}</div>\n                              <div class='desc'>{{Description}}</div>\n                            </div>\n                          </div>\n                      </a>",
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