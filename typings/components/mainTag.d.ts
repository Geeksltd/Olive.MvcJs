import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";
interface UrlData {
    url: string;
    status: string;
}
export declare class MainTagHelper implements IService {
    private url;
    private ajaxRedirect;
    private responseProcessor;
    data: {
        [key: string]: UrlData;
    };
    constructor(url: Url, ajaxRedirect: AjaxRedirect, responseProcessor: ResponseProcessor);
    enableLink(selector: JQuery): void;
    initialize(): void;
    tryOpenFromUrl(): void;
    changeUrl(url: string, mainTagName: string): void;
    render(event?: JQueryEventObject, url?: string): void;
    protected openWithUrl(mainTagName: string): void;
}
export default class MainTag {
    private urlService;
    private ajaxRedirect;
    private helper;
    private url;
    private mainTagName;
    private element;
    constructor(urlService: Url, ajaxRedirect: AjaxRedirect, helper: MainTagHelper, url: string, mainTagName: string);
    onComplete(success: Boolean): void;
    render(changeUrl?: boolean): void;
    protected isValidUrl(mainTagUrl: string): boolean;
}
export {};
