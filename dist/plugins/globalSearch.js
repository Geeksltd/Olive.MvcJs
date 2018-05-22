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
            var urlsList = this.input.attr("globalsearch-source") || '';
            $.ajax({
                url: urlsList,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: function (response) {
                    var _loop_1 = function (url) {
                        try {
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
                                href: "{{Url}}",
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
                                            url: url + "api/search",
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
                        }
                        catch (e) {
                            console.log("Seems that " + url + " microservice isn't responding.");
                            console.log(e);
                        }
                    };
                    var postData;
                    for (var _i = 0, response_1 = response; _i < response_1.length; _i++) {
                        var url = response_1[_i];
                        _loop_1(url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQXdIQztZQXZIRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLCtCQUErQixDQUFDO2dCQUFFLE9BQU87O2dCQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDN0UsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztnQkFDakUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7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