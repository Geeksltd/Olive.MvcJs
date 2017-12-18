export default class WindowContext {
    static initialize(): void;
    static events: {
        [event: string]: Function[];
    };
    static findContainerIFrame(): HTMLIFrameElement;
    static isWindowModal(): boolean;
    static expandModalToFitPicker(target: any): void;
    static adjustModalHeight(overflow?: number): void;
    static handleAjaxResponseError(response: any): void;
    static toJson(data: any): any;
    static applyColumns(event: JQueryEventObject): void;
    static enableSelectColumns(container: any): void;
    static enableInstantSearch(control: any): void;
    static enableSelectAllToggle(event: any): void;
    static enableUserHelp(element: JQuery): void;
    static handleDefaultButton(event: JQueryEventObject): boolean;
    static paginationSizeChanged(event: Event): void;
    static enableAjaxPaging(event: JQueryEventObject): void;
    static enableAjaxSorting(event: JQueryEventObject): void;
    static adjustIFrameHeightToContents(iframe: any): void;
    static setSortHeaderClass(thead: JQuery): void;
    static cleanUpNumberField(field: JQuery): void;
    static ensureModalResize(): void;
}
