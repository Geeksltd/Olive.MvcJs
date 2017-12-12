export declare class WindowContext {
    static setting: {
        TIME_FORMAT: string;
        MINUTE_INTERVALS: number;
        DATE_LOCALE: string;
    };
    static isWindowModal(): boolean;
    static getContainerIFrame(): HTMLElement;
    static adjustModalHeightForDataPicker(target: any): void;
    static adjustModalHeight(overflow?: number): void;
    static getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    static handleAjaxResponseError(response: any): void;
    static hidePleaseWait(): void;
}
