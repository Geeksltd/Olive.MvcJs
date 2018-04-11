import Url from "olive/components/url";
import Form from "olive/components/form";
import Config from "olive/config";
import FormAction from "olive/mvc/formAction";

export default class AutoComplete {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery;

    public static enable(selector: JQuery) {
        selector.each((i, e) => new AutoComplete($(e)).enable());
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        if (this.input.is("[data-typeahead-enabled=true]")) return;
        else this.input.attr("data-typeahead-enabled", true);
        this.input.wrap("<div class='typeahead__container'></div>");

        this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
        if (this.valueField.length === 0) {
            console.log("Failed to find the value field for auto-complete:");
            console.log(this.input);
        }

        let url = this.input.attr("autocomplete-source") || '';

        var postData = {};
        postData[this.input.attr("name")] = "{{query}}";

        this.input
                 .data("selected-text", "")
                 .on('input', () => this.clearValue())
                 .on("typeahead:selected", (e, i) => this.itemSelected(i))
                .typeahead({
                    minLength: 1,
                    dynamic: true,
                    debug: true,
                    delay: 500,
                    backdrop: { "background-color": "#fff" },
                    emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
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
                                    data: postData
                                };
                            }
                        }
                    },
                    callback: {
                        onClick: function (node, query, event) {
                            $("[name='" + node.attr("name").slice(0, -5) + "']").val(event.Value);
                        }
                    }
                });
    }

    clearValue() {
        if (this.input.val() === "") this.valueField.val("");
        if (this.input.val() !== this.input.data("selected-text"))
            this.valueField.val("");
    }

    itemSelected(item: any) {
        
        if (item != undefined) {
            this.valueField.val(item.Value);
            this.input.data("selected-text", item.Display);
            this.input.val(item.Display);
        } else {
            console.log("Clearing text, item is undefined");
            this.input.data("selected-text", "");
        }
        // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
        this.input.trigger("change");
    }
}
