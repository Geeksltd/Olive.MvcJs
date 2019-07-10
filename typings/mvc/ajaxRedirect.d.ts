import Waiting from 'olive/components/waiting';
import Url from 'olive/components/url';
import FormAction from 'olive/mvc/formAction';
export default class AjaxRedirect implements IService {
    private url;
    private formAction;
    private waiting;
    requestCounter: number;
    ajaxChangedUrl: number;
    isAjaxRedirecting: boolean;
    onRedirected: ((title: string, url: string) => void);
    onRedirectionFailed: ((url: string, response: JQueryXHR) => void);
    constructor(url: Url, formAction: FormAction, waiting: Waiting);
    defaultOnRedirected(title: string, url: string): void;
    defaultOnRedirectionFailed(url: string, response: JQueryXHR): void;
    enableBack(selector: JQuery): void;
    enableRedirect(selector: JQuery): void;
    redirect(event: JQueryEventObject): boolean;
    back(event: any): void;
    go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean): boolean;
}
