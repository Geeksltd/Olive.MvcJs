namespace Olive{
 
   export class AutoComplete{
        
        targetControl:any;
        awaitingAutocompleteResponses: number = 0;
        constructor(input:any){
            this.targetControl = input;
         }

        if (targetControl.is('[data-typeahead-enabled=true]')) return;
        else targetControl.attr('data-typeahead-enabled', true);
        var valueField = $("[name='" + targetControl.attr("name").slice(0, -5) + "']");
        if (valueField.length == 0) console.log('Could not find the value field for auto-complete.');
 
        var dataSource = (query, callback) => {
            this.awaitingAutocompleteResponses++;
            var url = targetControl.attr("autocomplete-source");       
            url = urlHelper.removeQuery(url, targetControl.attr('name')); // Remove old text.
            var data = DataHandler.getPostData(targetControl);

            setTimeout(() => {
                if (this.awaitingAutocompleteResponses > 1) {
                    this.awaitingAutocompleteResponses--
                    return;
                }

                $.post(url, data).fail(this.handleAjaxResponseError).done((result) => {
                    result = result.map((i) => {
                        return {
                            Display: i.Display || i.Text || i.Value,
                            Value: i.Value || i.Text || i.Display,
                            Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value
                        };
                    });          
                    return callback(result);
                     }).always(() => this.awaitingAutocompleteResponses--);
                  }, this.AUTOCOMPLETE_INPUT_DELAY);
                };

        var clearValue = (e) => {
            if (targetControl.val() === "") valueField.val("");
            if (targetControl.val() !== targetControl.data("selected-text")) valueField.val("");
        };

        var itemSelected = (e, item) => {
            if (item != undefined) {
                console.log('setting ' + item.Value);
                valueField.val(item.Value);
                targetControl.data("selected-text", item.Display);
            }else {
                console.log("Clearing text, item is undefined");
                targetControl.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            targetControl.trigger('change');
        };

        var itemBlured = (e, item) => {
            if (valueField.val() == "" && targetControl.val() != "") {
                // this hack is so when you paste something a focus out, it should set the hidden field
                var suggested = targetControl.closest(".twitter-typeahead").find(".tt-suggestion");
                var filtered = suggested.filter((e, obj) => (obj.innerText === targetControl.val()));
                if (filtered.length === 0 && suggested.length === 0) {
                    // the suggestion list has never been shown
                    // make typeahead aware of this change otherwise during blur it will clear the text
                    targetControl.typeahead('val', targetControl.val());
                    dataSource(targetControl.val(), data => {
                        if (data && data.length === 1) {
                            itemSelected(null, data[0]);
                            console.log('match text to suggestion finished');
                        } else {
                            console.warn("There is none or more than one items in the autocomplete data-source to match the given text. Cannot set the value.");
                        }
                    });
                }else {
                    // the suggestion list has been displayed
                    if (filtered.length === 0)
                        suggested.first().trigger("click");
                    else
                        filtered.first().trigger("click");
                }
            }
        };
 
        var dataset = {
            displayKey: 'Text', source: dataSource,
            templates: { suggestion: (item) => item.Display, empty: "<div class='tt-suggestion'>Not found</div>" }
        };
        targetControl.data("selected-text", "").on('input', clearValue).on('blur', itemBlured).on('typeahead:selected', itemSelected).typeahead({ minLength: 0
   }
        
}
