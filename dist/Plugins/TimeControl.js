exports.__esModule = true;
var WindowContext_1 = require("../Components/WindowContext");
var Config_1 = require("../Config");
var TimeControl = /** @class */ (function () {
    function TimeControl(targetInput) {
        var input = targetInput;
        if (WindowContext_1.WindowContext.isWindowModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return WindowContext_1.WindowContext.adjustModalHeightForDataPicker(e); });
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return WindowContext_1.WindowContext.adjustModalHeightForDataPicker(e); });
        }
        input.attr("data-autofocus", "disabled");
        input.datetimepicker({
            format: Config_1.Config.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || Config_1.Config.MINUTE_INTERVALS.toString()),
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: Config_1.Config.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;
        input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
    }
    return TimeControl;
}());
exports.TimeControl = TimeControl;
//# sourceMappingURL=TimeControl.js.map