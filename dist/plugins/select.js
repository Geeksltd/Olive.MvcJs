define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Select = /** @class */ (function () {
        function Select() {
        }
        //https://developer.snapappointments.com/bootstrap-select/
        Select.prototype.enableEnhance = function (selector, delayedInitializer) {
            var _this = this;
            delayedInitializer.initialize(selector, function (i, e) { return _this.enhance($(e)); });
        };
        Select.prototype.enhance = function (selectControl) {
            selectControl.selectpicker();
        };
        Select.prototype.replaceSource = function (controlId, items) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvc2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBR0E7UUFBQTtRQXlCQSxDQUFDO1FBeEJHLDBEQUEwRDtRQUVuRCw4QkFBYSxHQUFwQixVQUFxQixRQUFnQixFQUFFLGtCQUFzQztZQUE3RSxpQkFFQztZQURHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFTyx3QkFBTyxHQUFmLFVBQWdCLGFBQXFCO1lBQ2pDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNqQyxDQUFDO1FBRU0sOEJBQWEsR0FBcEIsVUFBcUIsU0FBaUIsRUFBRSxLQUFLO1lBRXpDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFbEMsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNuQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQy9GO2FBRUo7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQy9DO1FBQ0wsQ0FBQztRQUNMLGFBQUM7SUFBRCxDQUFDLEFBekJELElBeUJDIn0=