
import WindowContext from "../Components/WindowContext"
import   Config   from "../Config"

export default class DatePicker {
    input: any;

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    show() {

        if (WindowContext.isWindowModal()) {
            this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", (e) => WindowContext.adjustModalHeightForDataPicker(e));
            this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", (e) => WindowContext.adjustModalHeightForDataPicker(e));
        }

        this.input.attr("data-autofocus", "disabled");
        var control = this.input.attr("data-control");
        var viewMode = this.input.attr("data-view-mode") || 'days';

        if (control == "date-picker") {
            (<any>this.input).datetimepicker({
                format: Config.DATE_FORMAT,
                useCurrent: false,
                showTodayButton: true,
                icons: { today: 'today' },
                viewMode: viewMode,
                keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                locale: Config.DATE_LOCALE
            }).data("DateTimePicker").keyBinds().clear = null;
            // Now make calendar icon clickable as well             
            this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(() => { this.input.focus(); });
        }
        else alert("Don't know how to handle date control of " + control);
    }
}




