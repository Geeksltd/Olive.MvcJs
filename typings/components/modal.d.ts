import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";
export declare class ModalHelper implements IService {
    private url;
    private ajaxRedirect;
    private responseProcessor;
    current: any;
    currentModal: Modal;
    isAjaxModal: boolean;
    isClosingModal: boolean;
    constructor(url: Url, ajaxRedirect: AjaxRedirect, responseProcessor: ResponseProcessor);
    enableLink(selector: JQuery): void;
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
    open(event?: JQueryEventObject, url?: string, options?: any): void;
    openiFrame(event?: JQueryEventObject, url?: string, options?: any): void;
    protected openWithUrl(): void;
}
export default class Modal {
    private urlService;
    private ajaxRedirect;
    private helper;
    isOpening: boolean;
    opener: JQuery;
    private url;
    private rawUrl;
    private modalOptions;
    scrollPosition: number;
    constructor(urlService: Url, ajaxRedirect: AjaxRedirect, helper: ModalHelper, event?: JQueryEventObject, targeturl?: string, opt?: any);
    onComplete(success: Boolean): void;
    onClose(): void;
    open(changeUrl?: boolean): boolean;
    openiFrame(changeUrl?: boolean): boolean;
    shouldKeepScroll(): boolean;
    protected getModalTemplateForAjax(options: any): string;
    protected getModalTemplateForiFrame(options: any): string;
}
