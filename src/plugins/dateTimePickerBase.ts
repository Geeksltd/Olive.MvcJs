import { ModalHelper } from "olive/components/modal"
import Config from "olive/config"

export default abstract class dateTimePickerBase {
    protected abstract controlType: string;
    protected abstract format: string;

    constructor(protected input: JQuery, private modalHelper: ModalHelper) { }

    protected abstract modifyOptions(options: any): void;

    public show() {

        if (window.isModal()) {
            this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
            this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
        }

        this.input.attr("data-autofocus", "disabled");
        const control = this.input.data("control");
        const stepping = Number(this.input.data("minute-steps") || "1");

        if (control == this.controlType) {
            let options = {
                format: this.format,
                useCurrent: false,
                showTodayButton: true,
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
                locale: Config.DATE_LOCALE,
                stepping: stepping
            };

            this.modifyOptions(options);

            this.input.datetimepicker(options);

            // Now make calendar icon clickable as well             
            this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(() => this.input.focus());
        }
        else alert("Don't know how to handle date control of " + control);
    }
}
