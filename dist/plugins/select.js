define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Select = /** @class */ (function () {
        function Select() {
        }
        Select.enableEnhance = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        Select.enhance = function (selectControl) {
            selectControl.chosen({ disable_search_threshold: 5, width: "100%" });
        };
        Select.replaceSource = function (controlId, items) {
            var $control = $('#' + controlId);
            if ($control.is("select")) {
                $control.empty();
                for (var i = 0; i < items.length; i++) {
                    $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
                }
            }
            else {
                console.log("Unable to replace list items");
            }
        };
        return Select;
    }());
    exports.default = Select;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvc2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQXNCQSxDQUFDO1FBcEJpQixvQkFBYSxHQUEzQixVQUE0QixRQUFlO1lBQTNDLGlCQUF3RjtZQUEzQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUFBLENBQUM7UUFFakYsY0FBTyxHQUFkLFVBQWUsYUFBcUI7WUFDaEMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLHdCQUF3QixFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRWEsb0JBQWEsR0FBM0IsVUFBNEIsU0FBaUIsRUFBRSxLQUFLO1lBRWhELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFbEMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ3BDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDaEcsQ0FBQztZQUVMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNMLENBQUM7UUFDTCxhQUFDO0lBQUQsQ0FBQyxBQXRCRCxJQXNCQyJ9