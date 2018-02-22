export default class FormAction {
    static isAwaitingAjaxResponse: boolean;
    static events: {
        [event: string]: Function[];
    };
    static invokeWithPost(event: any): boolean;
    static invokeWithAjax(event: any, actionUrl: any, syncCall: boolean, callback: any): boolean;
    static onAjaxResponseError(response: any): void;
}
