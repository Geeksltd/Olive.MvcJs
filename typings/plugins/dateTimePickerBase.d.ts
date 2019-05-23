export default abstract class dateTimePickerBase {
    input: JQuery;
    abstract controlType: string;
    abstract format: string;
    constructor(targetInput: JQuery);
    abstract modifyOptions(options: any): void;
    show(): void;
}
