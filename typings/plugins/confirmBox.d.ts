export default class ConfirmBoxFactory implements IService {
    enable(selector: JQuery): void;
}
export declare class ConfirmBox {
    protected button: JQuery;
    constructor(button: JQuery);
    enable(): void;
    protected setButtonsLabel(ok: string, cancel: string): void;
    protected showConfirm(text: string, yesCallback: () => void): void;
}
