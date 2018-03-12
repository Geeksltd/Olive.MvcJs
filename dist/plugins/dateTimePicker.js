define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, modal_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimePicker = /** @class */ (function () {
        function DateTimePicker(targetInput) {
            var input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
            }
            input.attr("data-autofocus", "disabled");
            input.datetimepicker({
                format: config_1.default.DATE_TIME_FORMAT,
                useCurrent: false,
                keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                locale: config_1.default.DATE_LOCALE
            }).data("DateTimePicker").keyBinds().clear = null;
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
        }
        DateTimePicker.enable = function (selector) { selector.each(function (i, e) { return new DateTimePicker($(e)); }); };
        return DateTimePicker;
    }());
    exports.default = DateTimePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBR0ksd0JBQVksV0FBZ0I7WUFDeEIsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBRXhCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxlQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztnQkFDOUYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1lBQ2xHLENBQUM7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3pDLEtBQUssQ0FBQyxjQUFjLENBQUM7Z0JBQ2pCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLGdCQUFnQjtnQkFDL0IsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUMzRSxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO2FBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRWxELEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDLGNBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEcsQ0FBQztRQW5CYSxxQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQXhCLENBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFvQmpHLHFCQUFDO0lBQUQsQ0FBQyxBQXJCRCxJQXFCQyJ9