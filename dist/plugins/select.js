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
            //this fix chosen issue with jQuery validation (https://github.com/harvesthq/chosen/issues/515#issuecomment-55901946)
            if (selectControl.css('display') === 'none') {
                selectControl.next(".chosen-container").prepend(selectControl.detach());
                selectControl.attr("style", "display:visible; position:absolute; clip:rect(0,0,0,0)");
                selectControl.on("click focus keyup change", function () {
                    selectControl.trigger("blur");
                });
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvc2VsZWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQThCQSxDQUFDO1FBNUJpQixvQkFBYSxHQUEzQixVQUE0QixRQUFnQjtZQUE1QyxpQkFBOEY7WUFBOUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFBQyxDQUFDO1FBRXZGLGNBQU8sR0FBZCxVQUFlLGFBQXFCO1lBQ2hDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRSx3QkFBd0IsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDckUscUhBQXFIO1lBQ3JILElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLEVBQUU7Z0JBQ3pDLGFBQWEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ3hFLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHdEQUF3RCxDQUFDLENBQUM7Z0JBQ3RGLGFBQWEsQ0FBQyxFQUFFLENBQUMsMEJBQTBCLEVBQUU7b0JBQ3pDLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDO1FBRWEsb0JBQWEsR0FBM0IsVUFBNEIsU0FBaUIsRUFBRSxLQUFLO1lBRWhELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUM7WUFFbEMsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUN2QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNuQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7aUJBQy9GO2FBRUo7aUJBQU07Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO2FBQy9DO1FBQ0wsQ0FBQztRQUNMLGFBQUM7SUFBRCxDQUFDLEFBOUJELElBOEJDIn0=