import dateTimePickerBase from "./dateTimePickerBase";
import Config from "olive/config";

export default class DateTimePicker extends dateTimePickerBase {
    controlType = "date-picker|time-picker";
    format = Config.DATE_TIME_FORMAT;

    public static enable(selector: JQuery) { selector.each((i, e) => new DateTimePicker($(e)).show()); }

    constructor(targetInput: JQuery) {
        super(targetInput);
    }

    modifyOptions(options: any): void {
        $.extend(options, {
            sideBySide: true,
            showClear: true,
        });
    }
}
