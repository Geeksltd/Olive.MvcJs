import dateTimePickerBase from "./dateTimePickerBase";
import { ModalHelper } from "olive/components/modal";
import { DelayedInitializer } from "./delayedInitializer";
export declare class DateTimePickerFactory implements IService {
    private modalHelper;
    private delayedInitializer;
    constructor(modalHelper: ModalHelper, delayedInitializer: DelayedInitializer);
    enable(selector: JQuery): void;
}
export default class DateTimePicker extends dateTimePickerBase {
    protected controlType: string;
    protected format: string;
    constructor(targetInput: JQuery, modalHelper: ModalHelper);
    protected modifyOptions(options: any): void;
}
