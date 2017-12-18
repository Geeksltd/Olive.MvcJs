export default class AjaxRedirect {
    static ajaxChangedUrl: number;
    static isAjaxRedirecting: boolean;
    static enable(event: JQueryEventObject): boolean;
    static back(event: any): void;
    static go(url: string, trigger?: JQuery, isBack?: boolean, keepScroll?: boolean, addToHistory?: boolean): boolean;
}
