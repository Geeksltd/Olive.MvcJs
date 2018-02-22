export default class AjaxRedirect {
    static ajaxChangedUrl: number;
    static isAjaxRedirecting: boolean;
    static enable(event: JQueryEventObject, callback: any): boolean;
    static back(event: any, backCallback: any): void;
    static go(url: string, trigger: JQuery, isBack: boolean, keepScroll: boolean, addToHistory: boolean, callback: (response: any, containerModule: JQuery, trigger: JQuery) => void): boolean;
}
