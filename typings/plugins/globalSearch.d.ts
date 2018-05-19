export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
