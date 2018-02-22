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
            selectControl.chosen({ disable_search_threshold: 5 });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1BsdWdpbnMvU2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQXNCQSxDQUFDO1FBcEJpQixvQkFBYSxHQUEzQixVQUE0QixRQUFlO1lBQTNDLGlCQUF3RjtZQUEzQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUFBLENBQUM7UUFFakYsY0FBTyxHQUFkLFVBQWUsYUFBcUI7WUFDaEMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLHdCQUF3QixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVhLG9CQUFhLEdBQTNCLFVBQTRCLFNBQWlCLEVBQUUsS0FBSztZQUVoRCxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBRWxDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNwQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hHLENBQUM7WUFFTCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDTCxDQUFDO1FBQ0wsYUFBQztJQUFELENBQUMsQUF0QkQsSUFzQkMifQ==