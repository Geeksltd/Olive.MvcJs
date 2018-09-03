export default class AutoComplete {
    input: JQuery;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    static enable(selector: JQuery): void;
    constructor(targetInput: JQuery);
    enable(): void;
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
