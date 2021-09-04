define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoCompleteFactory = void 0;
    var AutoCompleteFactory = /** @class */ (function () {
        function AutoCompleteFactory(url, form, serverInvoker) {
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        AutoCompleteFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new AutoComplete($(e), _this.url, _this.form, _this.serverInvoker).enable(); });
        };
        return AutoCompleteFactory;
    }());
    exports.AutoCompleteFactory = AutoCompleteFactory;
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(input, url, form, serverInvoker) {
            this.input = input;
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        AutoComplete.setOptions = function (options) {
            AutoComplete.customOptions = options;
        };
        AutoComplete.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-typeahead-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-typeahead-enabled", "true");
            }
            if (this.input.is("[data-change-action]")) {
                this.serverInvoker.enableInvokeWithAjax(this.input, "typeahead:select", "data-change-action");
                this.input.on("change.deselect", function (event) {
                    setTimeout(function () {
                        if (!_this.valueField.val() && _this.selectedItemOnEnter) {
                            _this.input.trigger("typeahead:select", { event: event, item: undefined });
                        }
                    }, 100);
                });
                this.input.on("focus.deselect", function () { return _this.selectedItemOnEnter = _this.valueField.val(); });
            }
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            this.input
                .wrap("<span class='typehead-chevron-down'></span>")
                .before('<i class="fas fa-chevron-down"></i>')
                .data("selected-text", "")
                .on("input", function () { return _this.clearValue(); })
                .typeahead($.extend(true, this.getDefaultOptions(), AutoComplete.customOptions, this.getMandatoryOptions()));
        };
        AutoComplete.prototype.getMandatoryOptions = function () {
            var _this = this;
            var url = this.input.attr("autocomplete-source") || "";
            url = this.url.effectiveUrlProvider(url, this.input);
            return {
                source: {
                    values: {
                        display: "Display",
                        data: [{
                                Display: "",
                                Text: "",
                                Value: "",
                            }],
                        ajax: function (_) {
                            return {
                                type: "POST",
                                url: url,
                                data: _this.getPostData(),
                                xhrFields: { withCredentials: true },
                            };
                        },
                    },
                },
                callback: this.getMandatoryCallbacks(),
            };
        };
        AutoComplete.prototype.getMandatoryCallbacks = function () {
            var _this = this;
            var callback = {
                onClickAfter: function (node, a, item, event) {
                    _this.itemSelected(item);
                    _this.input.trigger("typeahead:select", { event: event, item: item });
                },
                onPopulateSource: function (node, data) {
                    var text = _this.input.val();
                    var index = data.findIndex(function (x) { return (x.Text || '').trim().toLowerCase() === text.toLowerCase().trim(); });
                    if (index >= 0) {
                        _this.valueField.val(data[index].Value);
                    }
                    return data;
                },
            };
            if (this.input.data("strict") === true) {
                callback = $.extend(callback, {
                    onHideLayout: function () {
                        if (_this.valueField.val() === "") {
                            _this.input.val("");
                        }
                    },
                });
            }
            return callback;
        };
        AutoComplete.prototype.getDefaultOptions = function () {
            var clientSideSearch = this.input.attr("clientside") || false;
            return {
                maxItem: 0,
                minLength: 0,
                dynamic: !clientSideSearch,
                searchOnFocus: true,
                debug: false,
                delay: 500,
                backdrop: false,
                correlativeTemplate: true,
                templateValue: "{{Text}}",
                emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
            };
        };
        AutoComplete.prototype.getPostData = function () {
            var postData = this.toObject(this.form.getPostData(this.input));
            postData[this.input.attr("name")] = "{{query}}";
            return postData;
        };
        AutoComplete.prototype.clearValue = function () {
            if (this.input.val() === "") {
                this.valueField.val("");
            }
            if (this.input.val() !== this.input.data("selected-text")) {
                this.valueField.val("");
            }
        };
        AutoComplete.prototype.itemSelected = function (item) {
            if (item) {
                var txt = (item.Text === null || item.Text === undefined || item.Text.trim() === "") ?
                    item.Display : item.Text;
                if (txt) {
                    txt = $("<div/>").html(txt).text();
                }
                this.valueField.val(item.Value);
                this.input.data("selected-text", txt);
                this.input.val(txt);
            }
            else {
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event
            // when it sets its value from drop down
            this.input.trigger("change");
        };
        // Convert current form array to simple plain object
        AutoComplete.prototype.toObject = function (arr) {
            var rv = {};
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var item = arr_1[_i];
                rv[item.name] = item.value;
            }
            return rv;
        };
        return AutoComplete;
    }());
    exports.default = AutoComplete;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b0NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvYXV0b0NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUlBO1FBRUksNkJBQ1ksR0FBUSxFQUNSLElBQVUsRUFDVixhQUE0QjtZQUY1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQUksQ0FBQztRQUV0QyxvQ0FBTSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBRUM7WUFERyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsR0FBRyxFQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUF4RSxDQUF3RSxDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUNMLDBCQUFDO0lBQUQsQ0FBQyxBQVZELElBVUM7SUFWWSxrREFBbUI7SUFZaEM7UUFVSSxzQkFDVyxLQUFhLEVBQ1osR0FBUSxFQUNSLElBQVUsRUFDVixhQUE0QjtZQUg3QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ1osUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLFNBQUksR0FBSixJQUFJLENBQU07WUFDVixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUFJLENBQUM7UUFSL0IsdUJBQVUsR0FBeEIsVUFBeUIsT0FBdUM7WUFDNUQsWUFBWSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUM7UUFDekMsQ0FBQztRQVFNLDZCQUFNLEdBQWI7WUFBQSxpQkFvQ0M7WUFuQ0csSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO2dCQUNoRCxPQUFPO2FBQ1Y7aUJBQU07Z0JBQ0gs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