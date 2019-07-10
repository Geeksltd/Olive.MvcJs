import Url from 'olive/components/url';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';
export declare class ModalHelper implements IService {
    private url;
    private ajaxRedirect;
    current: any;
    currentModal: Modal;
    isAjaxModal: boolean;
    isClosingModal: boolean;
    constructor(url: Url, ajaxRedirect: AjaxRedirect);
    initialize(): void;
    closeMe(): boolean;
    close(): boolean;
    setIFrameHeight(arg: any): void;
    enableEnsureHeight(selector: JQuery): void;
    ensureHeight(): void;
    adjustHeight(overflow?: number): void;
    expandToFitPicker(target: any): void;
    ensureNonModal(): void;
    tryOpenFromUrl(): void;
    changeUrl(url: string, iframe?: boolean): void;
    isOrGoingToBeModal(): boolean;
    openWithUrl(): void;
}
export default class Modal {
    private urlService;
    private ajaxRedirect;
    private helper;
    isOpening: boolean;
    opener: JQuery;
    url: string;
    rawUrl: string;
    modalOptions: any;
    scrollPosition: number;
    constructor(urlService: Url, ajaxRedirect: AjaxRedirect, helper: ModalHelper, event?: JQueryEventObject, targeturl?: string, opt?: any);
    open(changeUrl?: boolean): boolean;
    openiFrame(changeUrl?: boolean): boolean;
    shouldKeepScroll(): boolean;
    getModalTemplateForAjax(options: any): string;
    getModalTemplateForiFrame(options: any): string;
}
