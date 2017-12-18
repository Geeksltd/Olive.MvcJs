export default class Action {
    static ajaxChangedUrl: number;
    static isAjaxRedirecting: boolean;
    static isAwaitingAjaxResponse: boolean;
    static ajaxRedirectBackClicked(event: any, backCallback: any): void;
    static invokeActionWithPost(event: any): boolean;
    static enableAjaxRedirect(event: JQueryEventObject, callback: any): boolean;
    static invokeActionWithAjax(event: any, actionUrl: any, syncCall: boolean, callback: any): boolean;
    static ajaxRedirect(url: string, trigger: JQuery, isBack: boolean, keepScroll: boolean, addToHistory: boolean, callback: (response: any, containerModule: JQuery, trigger: JQuery) => void): boolean;
    static handleAjaxResponseError(response: any): void;
}
