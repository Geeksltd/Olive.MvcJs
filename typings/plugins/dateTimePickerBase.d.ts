import { ModalHelper } from "olive/components/modal";
export default abstract class dateTimePickerBase {
    protected input: JQuery;
    private modalHelper;
    abstract controlType: string;
    abstract format: string;
    constructor(input: JQuery, modalHelper: ModalHelper);
    abstract modifyOptions(options: any): void;
    show(): void;
}
