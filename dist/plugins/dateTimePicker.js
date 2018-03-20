define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, modal_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimePicker = (function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQU1BO1FBS0ksd0JBQVksV0FBZ0I7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUphLHFCQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQU1wRyw2QkFBSSxHQUFKO1lBQUEsaUJBMEJDO1lBeEJHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7WUFDdkcsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRTlDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxLQUFNLENBQUMsY0FBYyxDQUMzQjtvQkFDRyxVQUFVLEVBQUUsSUFBSTtvQkFDaEIsTUFBTSxFQUFFLGdCQUFNLENBQUMsZ0JBQWdCO29CQUMvQixVQUFVLEVBQUUsS0FBSztvQkFDakIsZUFBZSxFQUFFLElBQUk7b0JBQ3JCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7b0JBQ3hCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDaEYsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztpQkFDaEMsQ0FDTCxDQUFDLENBQUEsa0RBQWtEO2dCQUNoRCx3REFBd0Q7Z0JBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1lBQzFHLENBQUM7WUFDRCxJQUFJO2dCQUFDLEtBQUssQ0FBQywyQ0FBMkMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0wscUJBQUM7SUFBRCxDQUFDLEFBcENELElBb0NDIn0=