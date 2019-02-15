define(["require", "exports", "olive/components/form", "olive/components/url", "olive/mvc/formAction"], function (require, exports, form_1, url_1, formAction_1) {
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
                this.input.attr("data-typeahead-enabled", "true");
            if (this.input.is("[data-change-action]"))
                formAction_1.default.enableInvokeWithAjax(this.input, "typeahead:select", "data-change-action");
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            var url = this.input.attr("autocomplete-source") || '';
            url = url_1.default.effectiveUrlProvider(url, this.input);
            var postData = this.toObject(form_1.default.getPostData(this.input));
            postData[this.input.attr("name")] = "{{query}}";
            var clientSideSearch = this.input.attr("clientside") || false;
            var callback = {
                onClick: function (node, a, item, event) {
                    $("[name='" + node.attr("name").slice(0, -5) + "']").val(event.Value);
                },
                onClickAfter: function (node, a, item, event) {
                    _this.itemSelected(item);
                    _this.input.trigger("typeahead:select", { event: event, item: item });
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
            this.input
                .wrap("<span class='typehead-chevron-down'></span>")
                .before('<i class="fas fa-chevron-down"></i>')
                .data("selected-text", "")
                .on('input', function () { return _this.clearValue(); })
                .typeahead({
                minLength: 0,
                dynamic: !clientSideSearch,
                searchOnFocus: true,
                debug: false,
                delay: 500,
                backdrop: false,
                correlativeTemplate: true,
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
                                data: postData,
                                xhrFields: { withCredentials: true }
                            };
                        }
                    }
                },
                callback: callback
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b0NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvYXV0b0NvbXBsZXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBSUE7UUFTSSxzQkFBWSxXQUFtQjtZQVAvQixrQ0FBNkIsR0FBVyxDQUFDLENBQUM7WUFRdEMsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQU5hLG1CQUFNLEdBQXBCLFVBQXFCLFFBQWdCO1lBQ2pDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBTUQsNkJBQU0sR0FBTjtZQUFBLGlCQTBFQztZQXhFRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQztZQUMzRCxJQUFJO2dCQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXZELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3RDLG9CQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRTFGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUU3RSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2RCxHQUFHLEdBQUcsYUFBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFaEQsSUFBSSxRQUFRLEdBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWhFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFdBQVcsQ0FBQztZQUVoRCxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUU5RCxJQUFJLFFBQVEsR0FBRztnQkFDWCxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLO29CQUMxQixDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFFLENBQUM7Z0JBQ0QsWUFBWSxFQUFFLFVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSztvQkFDL0IsS0FBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDeEIsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxLQUFLLE9BQUEsRUFBRSxJQUFJLE1BQUEsRUFBRSxDQUFDLENBQUE7Z0JBQzNELENBQUM7YUFDSixDQUFDO1lBRUYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDckMsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO29CQUMxQixZQUFZLEVBQUU7d0JBQ1YsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7NEJBQzdCLEtBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMzQixDQUFDO2lCQUNKLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSztpQkFDTCxJQUFJLENBQUMsNkNBQTZDLENBQUM7aUJBQ25ELE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQztpQkFDN0MsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQ3pCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxVQUFVLEVBQUUsRUFBakIsQ0FBaUIsQ0FBQztpQkFDcEMsU0FBUyxDQUFDO2dCQUNQLFNBQVMsRUFBRSxDQUFDO2dCQUNaLE9BQU8sRUFBRSxDQUFDLGdCQUFnQjtnQkFDMUIsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLEtBQUssRUFBRSxLQUFLO2dCQUNaLEtBQUssRUFBRSxHQUFHO2dCQUNWLFFBQVEsRUFBRSxLQUFLO2dCQUNmLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLGFBQWEsRUFBRSw0Q0FBNEM7Z0JBQzNELE1BQU0sRUFBRTtvQkFDSixNQUFNLEVBQUU7d0JBQ0osT0FBTyxFQUFFLFNBQVM7d0JBQ2xCLElBQUksRUFBRSxDQUFDO2dDQUNILFNBQVMsRUFBRSxFQUFFO2dDQUNiLE1BQU0sRUFBRSxFQUFFO2dDQUNWLE9BQU8sRUFBRSxFQUFFOzZCQUNkLENBQUM7d0JBQ0YsSUFBSSxFQUFFLFVBQVUsS0FBSzs0QkFDakIsTUFBTSxDQUFDO2dDQUNILElBQUksRUFBRSxNQUFNO2dDQUNaLEdBQUcsRUFBRSxHQUFHO2dDQUNSLElBQUksRUFBRSxRQUFRO2dDQUNkLFNBQVMsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUU7NkJBQ3ZDLENBQUM7d0JBQ04sQ0FBQztxQkFDSjtpQkFDSjtnQkFDRCxRQUFRLEVBQUUsUUFBUTthQUNyQixDQUFDLENBQUM7UUFDWCxDQUFDO1FBRUQsaUNBQVUsR0FBVjtZQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDO2dCQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxtQ0FBWSxHQUFaLFVBQWEsSUFBUztZQUVsQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNQLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDN0csRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztnQkFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pDLENBQUM7WUFDRCw2SEFBNkg7WUFDN0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVELG9EQUFvRDtRQUNwRCwrQkFBUSxHQUFSLFVBQVMsR0FBa0M7WUFDdkMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ1osR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBQ0wsbUJBQUM7SUFBRCxDQUFDLEFBdEhELElBc0hDIn0=