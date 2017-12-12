"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WindowContext_1 = require("../Component/WindowContext");
const Config_1 = require("../Config");
class TimeControl {
    constructor(targetInput) {
        let input = targetInput;
        var windowCtx = WindowContext_1.WindowContext.getInstance();
        if (windowCtx.isWindowModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", (e) => windowCtx.adjustModalHeightForDataPicker(e));
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", (e) => windowCtx.adjustModalHeightForDataPicker(e));
        }
        input.attr("data-autofocus", "disabled");
        input.datetimepicker({
            format: Config_1.Config.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || Config_1.Config.MINUTE_INTERVALS.toString()),
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: Config_1.Config.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;
        input.parent().find(".fa-clock-o").parent(".input-group-addon").click(() => { input.focus(); });
    }
}
exports.TimeControl = TimeControl;
//# sourceMappingURL=TimeControl.js.map