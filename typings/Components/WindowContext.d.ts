export default class WindowContext {
    static initialize(): void;
    static events: {
        [event: string]: Function[];
    };
    static toJson(data: any): any;
    static fitFrameContentHeight(iframe: any): void;
}
