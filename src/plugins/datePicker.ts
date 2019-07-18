import Config from "olive/config"
import dateTimePickerBase from "./dateTimePickerBase";
import { ModalHelper } from "olive/components/modal";

export class DatePickerFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new DatePicker($(e), this.modalHelper).show()); }
}

export default class DatePicker extends dateTimePickerBase {
    protected controlType = "date-picker";
    protected format = Config.DATE_FORMAT;

    constructor(targetInput: JQuery, modalHelper: ModalHelper) {
        super(targetInput, modalHelper);
    }

    protected modifyOptions(options: any): void {
        $.extend(options, {
            viewMode: this.input.attr("data-view-mode") || 'days'
        });
    }
}
