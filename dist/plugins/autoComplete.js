define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // import FormAction from 'olive/mvc/formAction'
    var AutoCompleteFactory = /** @class */ (function () {
        function AutoCompleteFactory(url, form, formAction) {
            this.url = url;
            this.form = form;
            this.formAction = formAction;
        }
        AutoCompleteFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new AutoComplete($(e), _this.url, _this.form, _this.formAction).enable(); });
        };
        return AutoCompleteFactory;
    }());
    exports.AutoCompleteFactory = AutoCompleteFactory;
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(input, url, form, formAction) {
            this.input = input;
            this.url = url;
            this.form = form;
            this.formAction = formAction;
            this.awaitingAutocompleteResponses = 0;
        }
        AutoComplete.setOptions = function (options) {
            AutoComplete.customOptions = options;
        };
        AutoComplete.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-typeahead-enabled=true]"))
                return;
            else
                this.input.attr("data-typeahead-enabled", "true");
            if (this.input.is("[data-change-action]"))
                this.formAction.enableInvokeWithAjax_fa(this.input, "typeahead:select", "data-change-action");
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            var url = this.input.attr("autocomplete-source") || '';
            url = this.url.effectiveUrlProvider(url, this.input);
            var postData = this.toObject(this.form.getPostData(this.input));
            postData[this.input.attr("name")] = "{{query}}";
            var clientSideSearch = this.input.attr("clientside") || false;
            var callback = {
                onClick: function (node, a, item, event) {
                    // The following line is a compile error.
                    // $("[name='" + node.attr("name").slice(0, -5) + "']").val(event.Value);
                },
                onClickAfter: function (node, a, item, event) {
                    _this.itemSelected(item);
                    _this.input.trigger("typeahead:select", { event: event, item: item });
                },
                onPopulateSource: function (node, data) {
                    var text = _this.input.val();
                    var index = data.findIndex(function (x) { return x.Text.trim().toLowerCase() === text.toLowerCase().trim(); });
                    if (index >= 0)
                        _this.valueField.val(data[index].Value);
                    return data;
                }
            };
            if (this.input.data("strict") === true) {
                callback = $.extend(callback, {
                    onHideLayout: function () {
                        if (_this.valueField.val() === "")
                            _this.input.val("");
                    }
                });
            }
            var defaultOptions = {
                minLength: 0,
                dynamic: !clientSideSearch,
                searchOnFocus: true,
                debug: false,
                delay: 500,
                backdrop: false,
                correlativeTemplate: true,
                emptyTemplate: "<div class='tt-suggestion'>Not found</div>"
            };
            var mandatoryOptions = {
                source: {
                    values: {
                        display: "Display",
                        data: [{
                                "Display": "",
                                "Text": "",
                                "Value": ""
                            }],
                        ajax: function (query) {
                            return {
                                type: "POST",
                                url: url,
                                data: postData,
                                xhrFields: { withCredentials: true }
                            };
                        }
                    }
                },
                callback: callback
            };
            this.input
                .wrap("<span class='typehead-chevron-down'></span>")
                .before('<i class="fas fa-chevron-down"></i>')
                .data("selected-text", "")
                .on('input', function () { return _this.clearValue(); })
                .typeahead($.extend(defaultOptions, AutoComplete.customOptions, mandatoryOptions));
        };
        AutoComplete.prototype.clearValue = function () {
            if (this.input.val() === "")
                this.valueField.val("");
            if (this.input.val() !== this.input.data("selected-text"))
                this.valueField.val("");
        };
        AutoComplete.prototype.itemSelected = function (item) {
            if (item) {
                var txt = (item.Text == null || item.Text == undefined || item.Text.trim() == "") ? item.Display : item.Text;
                if (txt)
                    txt = $("<div/>").html(txt).text();
                this.valueField.val(item.Value);
                this.input.data("selected-text", txt);
                this.input.val(txt);
            }
            else {
                console.log("Clearing text, item is undefined");
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            this.input.trigger("change");
        };
        // Convert current form array to simple plain object
        AutoComplete.prototype.toObject = function (arr) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i)
                rv[arr[i].name] = arr[i].value;
            return rv;
        };
        return AutoComplete;
    }());
    exports.default = AutoComplete;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b0NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvYXV0b0NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBR0EsZ0RBQWdEO0lBRWhEO1FBRUksNkJBQW9CLEdBQVEsRUFDaEIsSUFBVSxFQUNWLFVBQTZCO1lBRnJCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBQUksQ0FBQztRQUV2QyxvQ0FBTSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBRUM7WUFERyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsR0FBRyxFQUFFLEtBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFyRSxDQUFxRSxDQUFDLENBQUM7UUFDbkcsQ0FBQztRQUNMLDBCQUFDO0lBQUQsQ0FBQyxBQVRELElBU0M7SUFUWSxrREFBbUI7SUFXaEM7UUFVSSxzQkFBbUIsS0FBYSxFQUNwQixHQUFRLEVBQ1IsSUFBVSxFQUNWLFVBQTZCO1lBSHRCLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDcEIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLFNBQUksR0FBSixJQUFJLENBQU07WUFDVixlQUFVLEdBQVYsVUFBVSxDQUFtQjtZQVZqQyxrQ0FBNkIsR0FBVyxDQUFDLENBQUM7UUFVTCxDQUFDO1FBUGhDLHVCQUFVLEdBQXhCLFVBQXlCLE9BQXVDO1lBQzVELFlBQVksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDO1FBQ3pDLENBQUM7UUFPTSw2QkFBTSxHQUFiO1lBQUEsaUJBd0ZDO1lBdEZHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMs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