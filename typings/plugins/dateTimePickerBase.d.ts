import { ModalHelper } from "olive/components/modal";
export default abstract class dateTimePickerBase {
    protected input: JQuery;
    private modalHelper;
    protected abstract controlType: string;
    protected abstract format: string;
    constructor(input: JQuery, modalHelper: ModalHelper);
    protected abstract modifyOptions(options: any): void;
    show(): void;
}
