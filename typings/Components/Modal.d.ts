export default class Modal {
    currentModal: any;
    isOpeningModal: boolean;
    isClosingModal: boolean;
    url: string;
    modalOptions: any;
    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any);
    openModal(): boolean;
    closeModal(): boolean;
    getModalTemplate(options: any): string;
}
