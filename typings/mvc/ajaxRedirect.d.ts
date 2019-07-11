import Waiting from 'olive/components/waiting';
import Url from 'olive/components/url';
import FormAction from 'olive/mvc/formAction';
import { ModalHelper } from 'olive/components/modal';
export default class AjaxRedirect implements IService {
    private url;
    private formAction;
    private waiting;
    private modalHelper;
    private requestCounter;
    private ajaxChangedUrl;
    private isAjaxRedirecting;
    onRedirected: ((title: string, url: string) => void);
    onRedirectionFailed: ((url: string, response: JQueryXHR) => void);
    constructor(url: Url, formAction: FormAction, waiting: Waiting, modalHelper: ModalHelper);
    defaultOnRedirected(title: string, url: string): void;
    defaultOnRedirectionFailed(url: string, response: JQueryXHR): void;
    enableBack(selector: JQuery): void;
    enableRedirect(selector: JQuery): void;
    private redirect;
    private back;
    go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean): boolean;
}
