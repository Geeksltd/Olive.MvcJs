import Url from 'olive/components/url';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';
export declare class ModalHelper implements IService {
    private url;
    private ajaxRedirect;
    current: any;
    currentModal: Modal;
    isAjaxModal: boolean;
    private isClosingModal;
    constructor(url: Url, ajaxRedirect: AjaxRedirect);
    initialize(): void;
    private closeMe;
    close(): boolean;
    private setIFrameHeight;
    enableEnsureHeight(selector: JQuery): void;
    private ensureHeight;
    adjustHeight(overflow?: number): void;
    expandToFitPicker(target: any): void;
    private ensureNonModal;
    tryOpenFromUrl(): void;
    changeUrl(url: string, iframe?: boolean): void;
    isOrGoingToBeModal(): boolean;
    private openWithUrl;
}
export default class Modal {
    private urlService;
    private ajaxRedirect;
    private helper;
    private isOpening;
    opener: JQuery;
    private url;
    private rawUrl;
    private modalOptions;
    scrollPosition: number;
    constructor(urlService: Url, ajaxRedirect: AjaxRedirect, helper: ModalHelper, event?: JQueryEventObject, targeturl?: string, opt?: any);
    open(changeUrl?: boolean): boolean;
    openiFrame(changeUrl?: boolean): boolean;
    shouldKeepScroll(): boolean;
    protected getModalTemplateForAjax(options: any): string;
    protected getModalTemplateForiFrame(options: any): string;
}
