export default class CustomRadio {
    input: any;
    checkedClassName: string;
    static handledClassName: string;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
}
