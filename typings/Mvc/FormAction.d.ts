import LiteEvent from 'olive/Components/LiteEvent';
export interface IViewUpdatedEventArgs {
    container: JQuery;
    trigger: any;
    isNewPage: boolean;
}
export default class FormAction {
    static isAwaitingAjaxResponse: boolean;
    static events: {
        [event: string]: Function[];
    };
    static dynamicallyLoadedScriptFiles: any[];
    static onViewChanged: LiteEvent<IViewUpdatedEventArgs>;
    static invokeWithPost(event: any): boolean;
    static invokeWithAjax(event: any, actionUrl: any, syncCall?: boolean): boolean;
    static onAjaxResponseError(response: any): void;
    static processAjaxResponse(response: any, containerModule: any, trigger: any): void;
    static raiseViewChanged(container: any, trigger: any, isNewPage?: boolean): void;
    static replaceMain(element: JQuery, trigger: any): void;
}
