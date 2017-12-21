define(["require", "exports", "olive/Components/Modal", "olive/Config"], function (require, exports, Modal_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TimeControl = /** @class */ (function () {
        function TimeControl(targetInput) {
            var input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return Modal_1.default.expandToFitPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return Modal_1.default.expandToFitPicker(e); });
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
        TimeControl.enable = function (selector) { selector.each(function (i, e) { return new TimeControl($(e)); }); };
        return TimeControl;
    }());
    exports.default = TimeControl;
});
//# sourceMappingURL=TimeControl.js.map