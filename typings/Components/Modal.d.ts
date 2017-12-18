export default class Modal {
    current: any;
    isOpening: boolean;
    isClosingModal: boolean;
    url: string;
    modalOptions: any;
    static initialize(): void;
    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any);
    open(): boolean;
    close(): boolean;
    getModalTemplate(options: any): string;
    static ensureHeight(): void;
    static adjustHeight(overflow?: number): void;
    static expandToFitPicker(target: any): void;
}
