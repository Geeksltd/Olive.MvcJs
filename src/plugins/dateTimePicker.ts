import dateTimePickerBase from "./dateTimePickerBase";
import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";
import { DelayedInitializer } from "./delayedInitializer";

export class DateTimePickerFactory implements IService {
    constructor(private modalHelper: ModalHelper,
        private delayedInitializer: DelayedInitializer) { }

    public enable(selector: JQuery) {
        this.delayedInitializer.initialize(selector, (i, e) => new DateTimePicker($(e), this.modalHelper).show());
    }
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
