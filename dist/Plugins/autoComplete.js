define(["require", "exports", "olive/Components/Url", "olive/Components/Form", "olive/Config", "olive/Mvc/FormAction"], function (require, exports, Url_1, Form_1, Config_1, FormAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.input = targetInput;
        }
        AutoComplete.enable = function (selector) { selector.each(function (i, e) { return new AutoComplete($(e)).enable(); }); };
        AutoComplete.prototype.enable = function () {
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
            this.input.data("selected-text", "").on('input', this.clearValue)
                .on('blur', this.itemBlured).on('typeahead:selected', this.itemSelected)
                .typeahead({ minLength: 0 }, dataset);
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
                $.post(url, data).fail(FormAction_1.default.onAjaxResponseError).done(function (result) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b0NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1BsdWdpbnMvQXV0b0NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBTUE7UUFPSSxzQkFBWSxXQUFnQjtZQUw1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFLVixJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztRQUFDLENBQUM7UUFGN0MsbUJBQU0sR0FBcEIsVUFBcUIsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBSXBHLDZCQUFNLEdBQU47WUFFSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDN0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztZQUVsRyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRzlCLElBQUksT0FBTyxHQUFHO2dCQUNWLFVBQVUsRUFBRSxNQUFN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