export default class Form {
    static enableDefaultButtonKeyPress(selector: JQuery): void;
    static enablecleanUpNumberField(selector: JQuery): void;
    static enablesubmitCleanGet(selector: JQuery): void;
    static merge(items: JQuerySerializeArrayElement[]): JQuerySerializeArrayElement[];
    static cleanJson(str: any): string;
    static getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    static DefaultButtonKeyPress(event: JQueryEventObject): boolean;
    static cleanUpNumberField(field: JQuery): void;
    static submitCleanGet(event: JQueryEventObject): boolean;
}
