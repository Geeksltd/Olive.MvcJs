import Waiting from "olive/components/waiting";
import Url from "olive/components/url";
import ResponseProcessor from "olive/mvc/responseProcessor";
export default class AjaxRedirect implements IService {
    protected url: Url;
    private responseProcessor;
    private waiting;
    private requestCounter;
    ajaxChangedUrl: number;
    isAjaxRedirecting: boolean;
    constructor(url: Url, responseProcessor: ResponseProcessor, waiting: Waiting);
    enableRedirect(selector: JQuery): void;
    protected onRedirected(trigger: JQuery, title: string, url: string): void;
    protected onMainTagRedirected(trigger: JQuery, title: string, url: string): boolean;
    protected finalTargetAsMainTag(trigger: JQuery): JQuery | undefined;
    protected onRedirectionFailed(trigger: JQuery, url: string, response: JQueryXHR): void;
    private redirect;
    go(inputUrl: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean, onComplete?: (successful: boolean) => void, ajaxTarget?: string, ajaxhref?: string): boolean;
}
