define(["require", "exports", "olive/Components/Url", "olive/Components/Form", "olive/Config", "olive/Mvc/FormAction"], function (require, exports, Url_1, Form_1, Config_1, FormAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(targetInput) {
            this.awaitingAutocompleteResponses = 0;
            this.input = targetInput;
        }
        AutoComplete.enable = function (selector) {
            selector.each(function (i, e) { return new AutoComplete($(e)).enable(); });
        };
        AutoComplete.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-typeahead-enabled=true]"))
                return;
            else
                this.input.attr("data-typeahead-enabled", true);
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            if (this.valueField.length == 0)
                console.log("Could not find the value field for auto-complete.");
            var dataSource = this.getData;
            //let dataset = {
            //    displayKey: 'Text', source: dataSource,
            //    templates: {
            //        suggestion: (item) => item.Display,
            //    }
            //};
            this.getData(null, function (result) {
                _this.input
                    .data("selected-text", "")
                    .on("blur", function () { return _this.itemBlured(); })
                    .on("typeahead:selected", function (e, i) { return _this.itemSelected(i); })
                    .typeahead({
                        minLength: 0,
                        searchOnFocus: true,
                        backdrop: {
                            "background-color": "#fff"
                        },
                        emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
                        source: result,
                        display: "Display",
                        templateValue: "{{Value}}"
                    });
            });
        };
        AutoComplete.prototype.clearValue = function () {
            if (this.input.val() === "")
                this.valueField.val("");
            if (this.input.val() !== this.input.data("selected-text"))
                this.valueField.val("");
        };
        AutoComplete.prototype.itemSelected = function (item) {
            if (item != undefined) {
                this.valueField.val(item.Value);
                this.input.data("selected-text", item.Display);
            }
            else {
                console.log("Clearing text, item is undefined");
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
            this.input.trigger("change");
        };
        AutoComplete.prototype.itemBlured = function () {
            var _this = this;
            if (this.valueField.val() == "" && this.input.val() != "") {
                // this hack is so when you paste something a focus out, it should set the hidden field
                var suggested = this.input
                    .closest(".twitter-typeahead")
                    .find(".tt-suggestion");
                var filtered = suggested.filter(function (e, obj) { return obj.innerText === _this.input.val(); });
                if (filtered.length === 0 && suggested.length === 0) {
                    // the suggestion list has never been shown
                    // make typeahead aware of this change otherwise during blur it will clear the text
                    this.input.typeahead("val", this.input.val());
                    this.getData(this.input.val(), function (data) {
                        if (data && data.length === 1) {
                            _this.itemSelected(data[0]);
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
            url = Url_1.default.removeQuery(url, this.input.attr("name")); // Remove the previous text.
            var data = Form_1.default.getPostData(this.input);
            setTimeout(function () {
                if (_this.awaitingAutocompleteResponses > 1) {
                    _this.awaitingAutocompleteResponses--;
                    return;
                }
                $.post(url, data)
                    .always(function () { return _this.awaitingAutocompleteResponses--; })
                    .fail(FormAction_1.default.onAjaxResponseError)
                    .done(function (result) {
                        result = result.map(function (i) {
                            return {
                                Display: i.Display || i.Text || i.Value,
                                Value: i.Value || i.Text || i.Display,
                                Text: i.Text ||
                                $("<div/>")
                                    .append($(i.Display))
                                    .text() ||
                                i.Value
                            };
                        });
                        return callback(result);
                    });
            }, Config_1.default.AUTOCOMPLETE_INPUT_DELAY);
        };
        return AutoComplete;
    }());
    exports.default = AutoComplete;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b0NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1BsdWdpbnMvQXV0b0NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBS0E7UUFTRSxzQkFBWSxXQUFnQjtZQVA1QixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFReEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDM0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQXFDQztZQXBDQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FDeEQsQ0FBQztZQUNGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1lBRW5FLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFFOUIsaUJBQWlCO1lBQ2pCLDZDQUE2QztZQUM3QyxrQkFBa0I7WUFDbEIsNkNBQTZDO1lBRTdDLE9BQU87WUFDUCxJQUFJO1lBRUosSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsVUFBQSxNQUFNO2dCQUN2QixLQUFJLENBQUMsS0FBSztxQkFDUCxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztxQkFFekIsRUFBRSxDQUFDLE1BQU0sRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFVBQVUsRUFBRSxFQUFqQixDQUFpQixDQUFDO3FCQUNuQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQztxQkFDeEQsU0FBUyxDQUFDO29CQUNULFNBQVMsRUFBRSxDQUFDO29CQUNaLGFBQWEsRUFBRSxJQUFJO29CQUNuQixRQUFRLEVBQUU7d0JBQ1Isa0JBQWtCLEVBQUUsTUFBTTtxQkFDM0I7b0JBQ0QsYUFBYSxFQUFFLDRDQUE0QztvQkFDM0QsTUFBTSxFQUFFLE1BQU07b0JBQ2QsT0FBTyxFQUFFLFNBQVM7b0JBQ2xCLGFBQWEsRUFBRSxXQUFXO2lCQUMzQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxpQ0FBVSxHQUFWO1lBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDeEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVELG1DQUFZLEdBQVosVUFBYSxJQUFTO1lBQ3BCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCw2SEFBNkg7WUFDN0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDL0IsQ0FBQztRQUVELGlDQUFVLEdBQVY7WUFBQSxpQkE2QkM7WUE1QkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMxRCx1RkFBdUY7Z0JBQ3ZGLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLO3FCQUN2QixPQUFPLENBQUMsb0JBQW9CLENBQUM7cUJBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUM3QixVQUFDLENBQUMsRUFBRSxHQUFHLElBQUssT0FBQSxHQUFHLENBQUMsU0FBUyxLQUFLLEtBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQWxDLENBQWtDLENBQy9DLENBQUM7Z0JBRUYsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRCwyQ0FBMkM7b0JBQzNDLG1GQUFtRjtvQkFDbkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLFVBQUEsSUFBSTt3QkFDakMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDOUIsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDTixPQUFPLENBQUMsSUFBSSxDQUNWLHFIQUFxSCxDQUN0SCxDQUFDO3dCQUNKLENBQUM7b0JBQ0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDTix5Q0FBeUM7b0JBQ3pDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO3dCQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlELElBQUk7d0JBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekMsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsOEJBQU8sR0FBUCxVQUFRLEtBQVUsRUFBRSxRQUFhO1lBQWpDLGlCQStCQztZQTlCQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pELEdBQUcsR0FBRyxhQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsNEJBQTRCO1lBQ2pGLElBQUksSUFBSSxHQUFHLGNBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhDLFVBQVUsQ0FBQztnQkFDVCxFQUFFLENBQUMsQ0FBQyxLQUFJLENBQUMsNkJBQTZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0MsS0FBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7b0JBQ3JDLE1BQU0sQ0FBQztnQkFDVCxDQUFDO2dCQUVELENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztxQkFDZCxNQUFNLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyw2QkFBNkIsRUFBRSxFQUFwQyxDQUFvQyxDQUFDO3FCQUNsRCxJQUFJLENBQUMsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDcEMsSUFBSSxDQUFDLFVBQUEsTUFBTTtvQkFDVixNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7d0JBQ25CLE1BQU0sQ0FBQzs0QkFDTCxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxLQUFLOzRCQUN2QyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxPQUFPOzRCQUNyQyxJQUFJLEVBQ0YsQ0FBQyxDQUFDLElBQUk7Z0NBQ04sQ0FBQyxDQUFDLFFBQVEsQ0FBQztxQ0FDUixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQ0FDcEIsSUFBSSxFQUFFO2dDQUNULENBQUMsQ0FBQyxLQUFLO3lCQUNWLENBQUM7b0JBQ0osQ0FBQyxDQUFDLENBQUM7b0JBQ0gsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLEVBQUUsZ0JBQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDSCxtQkFBQztJQUFELENBQUMsQUFySUQsSUFxSUMifQ==