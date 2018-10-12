
import Modal from "olive/components/modal"
import Config from "olive/config"

export default class DateTimePicker {
    input: any;

    public static enable(selector: JQuery) { selector.each((i, e) => new DateTimePicker($(e)).show()); }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    show() {

        if (window.isModal()) {
            this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => Modal.expandToFitPicker(e));
            this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => Modal.expandToFitPicker(e));
        }

        this.input.attr("data-autofocus", "disabled");
        let control = this.input.attr("data-control");

        if (control == "date-picker|time-picker") {
            (<any>this.input).datetimepicker(
                 {
                    sideBySide: true,
                    format: Config.DATE_TIME_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,                    
                    showClear: true,
                    icons: { 
                        today: "fa fa-calendar",
                        clear: "fa fa-eraser",
                        time: "fa fa-clock-o",
                        date: "fa fa-calendar",
                        up: "fa fa-chevron-up",
                        down: "fa fa-chevron-down",
                        next: "fa fa-chevron-right",
                        previous: "fa fa-chevron-left"
                     },
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: Config.DATE_LOCALE
             }
        );//.data("DateTimePicker").keyBinds().clear = null;
            // Now make calendar icon clickable as well             
            this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(() => this.input.focus());
        }
        else alert("Don't know how to handle date control of " + control);
    }
}





