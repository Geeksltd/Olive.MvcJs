import dateTimePickerBase from "./dateTimePickerBase";
import { ModalHelper } from "olive/components/modal";
export declare class DateTimePickerFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class DateTimePicker extends dateTimePickerBase {
    protected controlType: string;
    protected format: string;
    constructor(targetInput: JQuery, modalHelper: ModalHelper);
    protected modifyOptions(options: any): void;
}
