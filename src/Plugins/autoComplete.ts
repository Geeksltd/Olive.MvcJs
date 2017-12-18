
import Url from "olive/Components/Url"
import Form from "olive/Components/Form"
import Config from "olive/Config"
import Action from "olive/Components/Action"

export default class AutoComplete {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    public handle() {

        if (this.input.is('[data-typeahead-enabled=true]')) return;
        else this.input.attr('data-typeahead-enabled', true);
        this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
        if (this.valueField.length == 0) console.log('Could not find the value field for auto-complete.');

        var dataSource = this.getData;


        var dataset = {
            displayKey: 'Text', source: dataSource,
            templates: { suggestion: (item) => item.Display, empty: "<div class='tt-suggestion'>Not found</div>" }
        };

        this.input.data("selected-text", "").on('input', this.clearValue).on('blur', this.itemBlured).on('typeahead:selected', this.itemSelected).typeahead({ minLength: 0 }, dataset);
    }

    clearValue(e: any) {
        if (this.input.val() === "") this.valueField.val("");
        if (this.input.val() !== this.input.data("selected-text")) this.valueField.val("");
    }

    itemSelected(e: any, item: any) {
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
    }

    itemBlured(e: any, item: any) {
        if (this.valueField.val() == "" && this.input.val() != "") {
            // this hack is so when you paste something a focus out, it should set the hidden field
            var suggested = this.input.closest(".twitter-typeahead").find(".tt-suggestion");
            var filtered = suggested.filter((e, obj) => (obj.innerText === this.input.val()));

            if (filtered.length === 0 && suggested.length === 0) {
                // the suggestion list has never been shown
                // make typeahead aware of this change otherwise during blur it will clear the text
                this.input.typeahead('val', this.input.val());
                this.getData(this.input.val(), data => {
                    if (data && data.length === 1) {
                        this.itemSelected(null, data[0]);
                        console.log('match text to suggestion finished');
                    } else {
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
    }

    getData(query: any, callback: any) {
        this.awaitingAutocompleteResponses++;
        var url = this.input.attr("autocomplete-source");
        url = Url.removeQuery(url, this.input.attr('name')); // Remove old text.
        var data = Form.getPostData(this.input);

        setTimeout(() => {
            if (this.awaitingAutocompleteResponses > 1) {
                this.awaitingAutocompleteResponses--
                return;
            }

            $.post(url, data).fail(Action.handleAjaxResponseError).done((result) => {
                result = result.map((i) => {
                    return {
                        Display: i.Display || i.Text || i.Value,
                        Value: i.Value || i.Text || i.Display,
                        Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value
                    };
                });
                return callback(result);
            }).always(() => this.awaitingAutocompleteResponses--);
        }, Config.AUTOCOMPLETE_INPUT_DELAY);
    }
}