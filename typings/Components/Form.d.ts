export default class Form {
    static merge(items: JQuerySerializeArrayElement[]): JQuerySerializeArrayElement[];
    static cleanJson(str: any): string;
    static getPostData(trigger: JQuery): JQuerySerializeArrayElement[];
}
