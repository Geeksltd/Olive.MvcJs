import Waiting from "olive/components/waiting";
import Url from "olive/components/url";
import ResponseProcessor from "olive/mvc/responseProcessor";
export default class AjaxRedirect implements IService {
    private url;
    private responseProcessor;
    private waiting;
    private requestCounter;
    ajaxChangedUrl: number;
    isAjaxRedirecting: boolean;
    constructor(url: Url, responseProcessor: ResponseProcessor, waiting: Waiting);
    enableRedirect(selector: JQuery): void;
    protected onRedirected(title: string, url: string): void;
    protected onRedirectionFailed(url: string, response: JQueryXHR): void;
    private redirect;
    go(url: string, trigger?: JQuery, ajaxTarget?: string, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean, onComplete?: (successful: boolean) => void): boolean;
}
