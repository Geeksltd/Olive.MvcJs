import LiteEvent from 'olive/components/liteEvent';
export interface IViewUpdatedEventArgs {
    container: JQuery;
    trigger: any;
    isNewPage: boolean;
}
export default class FormAction {
    static events: {
        [event: string]: Function[];
    };
    static dynamicallyLoadedScriptFiles: any[];
    static onViewChanged: LiteEvent<IViewUpdatedEventArgs>;
    static enableInvokeWithAjax(selector: JQuery, event: string, attrName: string): void;
    static enableinvokeWithPost(selector: JQuery): void;
    static invokeWithPost(event: any): boolean;
    static invokeWithAjax(event: any, actionUrl: any, syncCall?: boolean): boolean;
    static onAjaxResponseError(jqXHR: JQueryXHR, status: string, error: string): void;
    static processAjaxResponse(response: any, containerModule: any, trigger: any, args: any): void;
    static raiseViewChanged(container: any, trigger: any, isNewPage?: boolean): void;
    static navigate(element: JQuery, trigger: any, args: any): void;
    private static processWithTheContent;
    private static updateUrl;
}
