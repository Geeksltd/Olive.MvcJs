define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, modal_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimePicker = /** @class */ (function () {
        function DateTimePicker(targetInput) {
            this.input = targetInput;
        }
        DateTimePicker.enable = function (selector) { selector.each(function (i, e) { return new DateTimePicker($(e)).show(); }); };
        DateTimePicker.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.attr("data-control");
            if (control == "date-picker|time-picker") {
                this.input.datetimepicker({
                    sideBySide: true,
                    format: config_1.default.DATE_TIME_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: { today: 'Date' },
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: config_1.default.DATE_LOCALE
                }); //.data("DateTimePicker").keyBinds().clear = null;
                // Now make calendar icon clickable as well             
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(function () { return _this.input.focus(); });
            }
            else
                alert("Don't know how to handle date control of " + control);
        };
        return DateTimePicker;
    }());
    exports.default = DateTimePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQU1BO1FBS0ksd0JBQVksV0FBZ0I7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUphLHFCQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQU1wRyw2QkFBSSxHQUFKO1lBQUEsaUJBMEJDO1lBeEJHLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNsQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO2dCQUNuRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO2FBQ3RHO1lBRUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFOUMsSUFBSSxPQUFPLElBQUkseUJBQXlCLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxLQUFNLENBQUMsY0FBYyxDQUMzQjtvQkFDRyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsTUFBTSxFQUFFLGdCQUFNLENBQUMsZ0JBQWdCO29CQUMvQixVQUFVLEVBQUUsS0FBSztvQkFDakIsZUFBZSxFQUFFLElBQUk7b0JBQ3JCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7b0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDaEYsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztpQkFDaEMsQ0FDTCxDQUFDLENBQUEsa0RBQWtEO2dCQUNoRCx3REFBd0Q7Z0JBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO2FBQ3pHOztnQkFDSSxLQUFLLENBQUMsMkNBQTJDLEdBQUcsT0FBTyxDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUNMLHFCQUFDO0lBQUQsQ0FBQyxBQXBDRCxJQW9DQyJ9