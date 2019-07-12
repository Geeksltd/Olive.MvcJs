import Waiting from 'olive/components/waiting';
import Url from 'olive/components/url';
import { ModalHelper } from 'olive/components/modal';
import ResponseProcessor from './responseProcessor';
import ServerInvoker from './serverInvoker';
export default class AjaxRedirect implements IService {
    private url;
    private responseProcessor;
    private serverInvoker;
    private waiting;
    private modalHelper;
    private requestCounter;
    private ajaxChangedUrl;
    private isAjaxRedirecting;
    constructor(url: Url, responseProcessor: ResponseProcessor, serverInvoker: ServerInvoker, waiting: Waiting, modalHelper: ModalHelper);
    enableBack(selector: JQuery): void;
    enableRedirect(selector: JQuery): void;
    protected onRedirected(title: string, url: string): void;
    protected onRedirectionFailed(url: string, response: JQueryXHR): void;
    private redirect;
    private back;
    go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean): boolean;
}
