import Modal from "olive/components/modal"
import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";

export class TimeControlFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new TimeControl($(e), this.modalHelper)); }
}
export default class TimeControl {
    constructor(targetInput: any, private modalHelper: ModalHelper) {
        let input = targetInput;

        if (window.isModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
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
