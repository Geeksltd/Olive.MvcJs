import dateTimePickerBase from "./dateTimePickerBase";
import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";

export class DateTimePickerFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new DateTimePicker($(e), this.modalHelper).show()); }
}

export default class DateTimePicker extends dateTimePickerBase {
    controlType = "date-picker|time-picker";
    format = Config.DATE_TIME_FORMAT;

    constructor(targetInput: JQuery, modalHelper: ModalHelper) {
        super(targetInput, modalHelper);
    }

    modifyOptions(options: any): void {
        $.extend(options, {
            sideBySide: true,
            showClear: true,
        });
    }
}
