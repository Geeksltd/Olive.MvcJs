import dateTimePickerBase from "./dateTimePickerBase";
import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";

export class DateTimePickerFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new DateTimePicker($(e), this.modalHelper).show()); }
}

export default class DateTimePicker extends dateTimePickerBase {
    protected controlType = "date-picker|time-picker";
    protected format = Config.DATE_TIME_FORMAT;

    constructor(targetInput: JQuery, modalHelper: ModalHelper) {
        super(targetInput, modalHelper);
    }

    protected modifyOptions(options: any): void {
        $.extend(options, {
            sideBySide: true,
            showClear: true,
        });
    }
}
