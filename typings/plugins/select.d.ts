import 'bootstrap-select';
export default class Select {
    static enableEnhance(selector: JQuery): void;
    static enhance(selectControl: JQuery): void;
    static replaceSource(controlId: string, items: any): void;
}
