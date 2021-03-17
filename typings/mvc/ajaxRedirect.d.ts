import ResponseProcessor from "olive/mvc/responseProcessor";
import Url from "olive/components/url";
import Waiting from "olive/components/waiting";
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
    go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean, onComplete?: (successful: boolean) => void): boolean;
}
