import Config from "olive/config"
import dateTimePickerBase from "./dateTimePickerBase";

export default class DatePicker extends dateTimePickerBase {
    controlType = "date-picker";
    format = Config.DATE_FORMAT;

    public static enable(selector: JQuery) { selector.each((i, e) => new DatePicker($(e)).show()); }

    constructor(targetInput: JQuery) {
        super(targetInput);
    }

    modifyOptions(options: any): void {
        $.extend(options, {
            viewMode: this.input.attr("data-view-mode") || 'days'
        });
    }
}
