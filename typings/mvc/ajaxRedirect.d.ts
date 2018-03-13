export default class AjaxRedirect {
    static ajaxChangedUrl: number;
    static isAjaxRedirecting: boolean;
    static onRedirected: ((title: string, url: string) => void);
    static defaultOnRedirected(title: string, url: string): void;
    static enableBack(selector: JQuery): void;
    static enableRedirect(selector: JQuery): void;
    static redirect(event: JQueryEventObject): boolean;
    static back(event: any): void;
    static go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean): boolean;
}
