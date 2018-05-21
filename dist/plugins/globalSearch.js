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
                                        url: item + "api/search",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQStHQztZQTlHRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDO2dCQUFFLE9BQU87O2dCQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDN0UsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztnQkFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7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