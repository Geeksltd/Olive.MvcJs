import 'bootstrap-select';
export default class Select implements IService {
    enableEnhance(selector: JQuery): void;
    enhance(selectControl: JQuery): void;
    replaceSource(controlId: string, items: any): void;
}
