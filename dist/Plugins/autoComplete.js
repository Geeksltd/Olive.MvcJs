define(["require", "exports", "olive/Components/WindowContext", "olive/Components/Url", "olive/Components/Form", "olive/Config"], function (require, exports, WindowContext_1, Url_1, Form_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.input = targetInput;
        }
        AutoComplete.prototype.handle = function () {
            if (this.input.is('[data-typeahead-enabled=true]'))
                return;
            else
                this.input.attr('data-typeahead-enabled', true);
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            if (this.valueField.length == 0)
                console.log('Could not find the value field for auto-complete.');
            var dataSource = this.getData;
            var dataset = {
                displayKey: 'Text', source: dataSource,
                templates: { suggestion: function (item) { return item.Display; }, empty: "<div class='tt-suggestion'>Not found</div>" }
            };
            this.input.data("selected-text", "").on('input', this.clearValue).on('blur', this.itemBlured).on('typeahead:selected', this.itemSelected).typeahead({ minLength: 0 }, dataset);
        };
        AutoComplete.prototype.clearValue = function (e) {
            if (this.input.val() === "")
                this.valueField.val("");
            if (this.input.val() !== this.input.data("selected-text"))
                this.valueField.val("");
        };
        AutoComplete.prototype.itemSelected = function (e, item) {
            if (item != undefined) {
                console.log('setting ' + item.Value);
                this.valueField.val(item.Value);
                this.input.data("selected-text", item.Display);
            }
            else {
                console.log("Clearing text, item is undefined");
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            this.input.trigger('change');
        };
        AutoComplete.prototype.itemBlured = function (e, item) {
            var _this = this;
            if (this.valueField.val() == "" && this.input.val() != "") {
                // this hack is so when you paste something a focus out, it should set the hidden field
                var suggested = this.input.closest(".twitter-typeahead").find(".tt-suggestion");
                var filtered = suggested.filter(function (e, obj) { return (obj.innerText === _this.input.val()); });
                if (filtered.length === 0 && suggested.length === 0) {
                    // the suggestion list has never been shown
                    // make typeahead aware of this change otherwise during blur it will clear the text
                    this.input.typeahead('val', this.input.val());
                    this.getData(this.input.val(), function (data) {
                        if (data && data.length === 1) {
                            _this.itemSelected(null, data[0]);
                            console.log('match text to suggestion finished');
                        }
                        else {
                            console.warn("There is none or more than one items in the autocomplete data-source to match the given text. Cannot set the value.");
                        }
                    });
                }
                else {
                    // the suggestion list has been displayed
                    if (filtered.length === 0)
                        suggested.first().trigger("click");
                    else
                        filtered.first().trigger("click");
                }
            }
        };
        AutoComplete.prototype.getData = function (query, callback) {
            var _this = this;
            this.awaitingAutocompleteResponses++;
            var url = this.input.attr("autocomplete-source");
            url = Url_1.default.removeQuery(url, this.input.attr('name')); // Remove old text.
            var data = Form_1.default.getPostData(this.input);
            setTimeout(function () {
                if (_this.awaitingAutocompleteResponses > 1) {
                    _this.awaitingAutocompleteResponses--;
                    return;
                }
                $.post(url, data).fail(WindowContext_1.default.handleAjaxResponseError).done(function (result) {
                    result = result.map(function (i) {
                        return {
                            Display: i.Display || i.Text || i.Value,
                            Value: i.Value || i.Text || i.Display,
                            Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value
                        };
                    });
                    return callback(result);
                }).always(function () { return _this.awaitingAutocompleteResponses--; });
            }, Config_1.default.AUTOCOMPLETE_INPUT_DELAY);
        };
        return AutoComplete;
    }());
    exports.default = AutoComplete;
});
//# sourceMappingURL=AutoComplete.js.map