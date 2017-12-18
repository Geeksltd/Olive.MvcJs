export default class OlivePage {
    modal: any;
    constructor();
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    pageLoad(container?: JQuery, trigger?: any): void;
    initializeUpdatedPage(container?: JQuery, trigger?: any): void;
    initialize(): void;
    skipNewWindows(): void;
    openLinkModal(event: JQueryEventObject): boolean;
    runStartupActions(container?: JQuery, trigger?: any, stage?: string): void;
    goBack(target: any): boolean;
    cleanGetFormSubmit(event: JQueryEventObject): boolean;
    executeActions(actions: any, trigger?: any): void;
    executeAction(action: any, trigger: any): boolean;
    openModal(event: any, url?: any, options?: any): void;
    executeNotifyAction(action: any, trigger: any): void;
    executeRedirectAction(action: any, trigger: any): void;
    refresh(keepScroll?: boolean): boolean;
    dynamicallyLoadedScriptFiles: any[];
    replaceMain(element: JQuery, trigger: any): void;
    invokeAjaxActionResult(response: any, containerModule: any, trigger: any): void;
    enableUserHelp(element: JQuery): void;
}
