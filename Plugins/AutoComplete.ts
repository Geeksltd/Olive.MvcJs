BaseApplicationPage.prototype.handleAutoComplete = function (input) {

        var _this = this;

        if (input.is('[data-typeahead-enabled=true]'))

            return;

        else

            input.attr('data-typeahead-enabled', true);

        var valueField = $("[name='" + input.attr("name").slice(0, -5) + "']");

        if (valueField.length == 0)

            console.log('Could not find the value field for auto-complete.');

        var dataSource = function (query, callback) {

            _this.awaitingAutocompleteResponses++;

            var url = input.attr("autocomplete-source");

            url = urlHelper.removeQuery(url, input.attr('name')); // Remove old text.

            var data = _this.getPostData(input);

            setTimeout(function () {

                if (_this.awaitingAutocompleteResponses > 1) {

                    _this.awaitingAutocompleteResponses--;

                    return;

                }

                $.post(url, data).fail(_this.handleAjaxResponseError).done(function (result) {

                    result = result.map(function (i) {

                        return {

                            Display: i.Display || i.Text || i.Value,

                            Value: i.Value || i.Text || i.Display,

                            Text: i.Text || $("<div/>").append($(i.Display)).text() || i.Value

                        };

                    });

                    return callback(result);

                }).always(function () { return _this.awaitingAutocompleteResponses--; });

            }, _this.AUTOCOMPLETE_INPUT_DELAY);

        };

        var clearValue = function (e) {

            if (input.val() === "")

                valueField.val("");

            if (input.val() !== input.data("selected-text"))

                valueField.val("");

        };

        var itemSelected = function (e, item) {

            if (item != undefined) {

                console.log('setting ' + item.Value);

                valueField.val(item.Value);

                input.data("selected-text", item.Display);

            }

            else {

                console.log("Clearing text, item is undefined");

                input.data("selected-text", "");

            }

            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down

            input.trigger('change');

        };

        var itemBlured = function (e, item) {

            if (valueField.val() == "" && input.val() != "") {

                // this hack is so when you paste something a focus out, it should set the hidden field

                var suggested = input.closest(".twitter-typeahead").find(".tt-suggestion");

                var filtered = suggested.filter(function (e, obj) { return (obj.innerText === input.val()); });

                if (filtered.length === 0 && suggested.length === 0) {

                    // the suggestion list has never been shown

                    // make typeahead aware of this change otherwise during blur it will clear the text

                    input.typeahead('val', input.val());

                    dataSource(input.val(), function (data) {

                        if (data && data.length === 1) {

                            itemSelected(null, data[0]);

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

        var dataset = {

            displayKey: 'Text', source: dataSource,

            templates: { suggestion: function (item) { return item.Display; }, empty: "<div class='tt-suggestion'>Not found</div>" }

        };

        input.data("selected-text", "").on('input', clearValue).on('blur', itemBlured).on('typeahead:selected', itemSelected).typeahead({ minLength: 0 }, dataset);

    };
