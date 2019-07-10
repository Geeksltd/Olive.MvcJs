import dateTimePickerBase from "./dateTimePickerBase";
import { ModalHelper } from "olive/components/modal";
export declare class DatePickerFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class DatePicker extends dateTimePickerBase {
    controlType: string;
    format: string;
    constructor(targetInput: JQuery, modalHelper: ModalHelper);
    modifyOptions(options: any): void;
}
