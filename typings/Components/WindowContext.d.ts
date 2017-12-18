export default class WindowContext {
    static events: {
        [event: string]: Function[];
    };
    static handleAjaxResponseError(response: any): void;
    static toJson(data: any): any;
    static applyColumns(event: JQueryEventObject): void;
    static enableSelectColumns(container: any): void;
    static enableSelectAllToggle(event: any): void;
    static enableUserHelp(element: JQuery): void;
    static handleDefaultButton(event: JQueryEventObject): boolean;
    static adjustIFrameHeightToContents(iframe: any): void;
    static cleanUpNumberField(field: JQuery): void;
}
