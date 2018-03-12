import Modal from "olive/components/modal"
import Config from "olive/config";

export default class DateTimePicker {
    public static enable(selector: JQuery) { selector.each((i, e) => new DateTimePicker($(e))); }

    constructor(targetInput: any) {
        let input = targetInput;

        if (window.isModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => Modal.expandToFitPicker(e));
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => Modal.expandToFitPicker(e));
        }

        input.attr("data-autofocus", "disabled");
        input.datetimepicker({
            format: Config.DATE_TIME_FORMAT,
            useCurrent: false,
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: Config.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;

        input.parent().find(".fa-clock-o").parent(".input-group-addon").click(() => { input.focus(); });
    }
}
