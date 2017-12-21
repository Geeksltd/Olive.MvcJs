import Modal from "olive/Components/Modal"
import Config from "olive/Config";

export default class TimeControl {
    public static enable(selector: JQuery) { selector.each((i, e) => new TimeControl($(e))); }

    constructor(targetInput: any) {
        let input = targetInput;

        if (window.isModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => Modal.expandToFitPicker(e));
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => Modal.expandToFitPicker(e));
        }

        input.attr("data-autofocus", "disabled");
        input.datetimepicker({
            format: Config.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || Config.MINUTE_INTERVALS.toString()),
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: Config.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;

        input.parent().find(".fa-clock-o").parent(".input-group-addon").click(() => { input.focus(); });
    }
}
