define(["require", "exports", "olive/Components/WindowContext", "olive/Config"], function (require, exports, WindowContext_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TimeControl = /** @class */ (function () {
        function TimeControl(targetInput) {
            var input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return WindowContext_1.default.expandModalToFitPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return WindowContext_1.default.expandModalToFitPicker(e); });
            }
            input.attr("data-autofocus", "disabled");
            input.datetimepicker({
                format: Config_1.default.TIME_FORMAT,
                useCurrent: false,
                stepping: parseInt(input.attr("data-minute-steps") || Config_1.default.MINUTE_INTERVALS.toString()),
                keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                locale: Config_1.default.DATE_LOCALE
            }).data("DateTimePicker").keyBinds().clear = null;
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
        }
        return TimeControl;
    }());
    exports.default = TimeControl;
});
//# sourceMappingURL=TimeControl.js.map