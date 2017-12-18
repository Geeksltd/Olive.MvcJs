export default class Form {
    static merge(items: JQuerySerializeArrayElement[]): JQuerySerializeArrayElement[];
    static cleanJson(str: any): string;
    static getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
    static onDefaultButtonKeyPress(event: JQueryEventObject): boolean;
    static cleanUpNumberField(field: JQuery): void;
}
