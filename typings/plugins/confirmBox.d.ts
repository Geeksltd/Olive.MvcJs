export default class ConfirmBox {
    button: any;
    static enable(selector: JQuery): void;
    constructor(targetButton: any);
    enable(): void;
    showConfirm(text: any, yesCallback: any): void;
}
