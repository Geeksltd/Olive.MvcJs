import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";
export declare class MainTagHelper implements IService {
    private url;
    private ajaxRedirect;
    private responseProcessor;
    private state?;
    constructor(url: Url, ajaxRedirect: AjaxRedirect, responseProcessor: ResponseProcessor);
    enableLink(selector: JQuery): void;
    initialize(): void;
    resetState(): void;
    tryOpenFromUrl(): void;
    private tryOpenFromUrlInternal;
    private tryOpenDefaultUrl;
    changeUrl(url: string, mainTagName: string, title?: string): void;
    invalidateChildren(mainTagElement: JQuery): void;
    render(event?: JQueryEventObject, url?: string): boolean;
    openWithUrl(mainTagName: string, url?: string): boolean;
    private validateState;
}
export default class MainTag {
    private urlService;
    private ajaxRedirect;
    private helper;
    private element;
    private mainTagName;
    private trigger;
    private url;
    constructor(urlService: Url, ajaxRedirect: AjaxRedirect, helper: MainTagHelper, baseUrl: string, element: JQuery, mainTagName: string, trigger: JQuery);
    render(changeUrl?: boolean): void;
    protected isValidUrl(mainTagUrl: string): boolean;
}
