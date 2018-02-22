export default class Form {
    static enableDefaultButtonKeyPress(selector: JQuery): void;
    static enablecleanUpNumberField(selector: JQuery): void;
    static enablesubmitCleanGet(selector: JQuery): void;
    static getCleanFormData(form: JQuery): JQuerySerializeArrayElement[];
    static cleanJson(str: any): string;
    static getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    static DefaultButtonKeyPress(event: JQueryEventObject): boolean;
    static cleanUpNumberField(field: JQuery): void;
    static submitCleanGet(event: JQueryEventObject): boolean;
}
