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
                                minLength: 2,
                                delay: 300,
                                dynamic: true,
                                backdrop: false,
                                emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
                                display: "Title",
                                template: "\n                            <div class='item'>\n                              <img class=\"icon\" src=\"{{IconUrl}}\" />\n                                <div class='title-wrapper'>\n                                  <div class='title'>{{Title}}</div>\n                                  <div class='desc'>{{Description}}</div>\n                                </div>\n                              </div>\n                          ",
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
                                            url: url,
                                            data: postData,
                                            xhrFields: {
                                                withCredentials: true
                                            }
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
                            });
                        }
                        catch (e) {
                            console.log("seems that there is a problem with the global search source " + url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsU2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZ2xvYmFsU2VhcmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFTSSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQTRIQztZQTNIRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUM3RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JB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