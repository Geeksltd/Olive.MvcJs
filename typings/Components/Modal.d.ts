export default class Modal {
    current: any;
    isOpening: boolean;
    isClosingModal: boolean;
    url: string;
    modalOptions: any;
    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any);
    open(): boolean;
    close(): boolean;
    getModalTemplate(options: any): string;
}
