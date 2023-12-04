export default class ConfirmBoxFactory implements IService {
    enable(selector: JQuery): void;
}
export declare class ConfirmBox {
    protected button: JQuery;
    constructor(button: JQuery);
    enable(): void;
    setButtonsLabel(ok: string, cancel: string): void;
    showConfirm(text: string, yesCallback: () => void): void;
}
