export default class Modal {
    static current: any;
    isOpening: boolean;
    static isClosingModal: boolean;
    url: string;
    modalOptions: any;
    static initialize(): void;
    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any);
    open(): boolean;
    static close(): boolean;
    getModalTemplate(options: any): string;
    static ensureHeight(): void;
    static adjustHeight(overflow?: number): void;
    static expandToFitPicker(target: any): void;
    static ensureNonModal(): void;
}
