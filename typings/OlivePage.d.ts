export default class OlivePage {
    constructor();
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    onViewChanged(container?: JQuery, trigger?: any, newPage?: boolean): void;
    initialize(): void;
    skipNewWindows(): void;
    openLinkModal(event: JQueryEventObject): boolean;
    goBack(target: any): boolean;
    cleanGetFormSubmit(event: JQueryEventObject): boolean;
    enableUserHelp(element: JQuery): void;
}
