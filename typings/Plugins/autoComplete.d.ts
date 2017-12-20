export default class AutoComplete {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    clearValue(e: any): void;
    itemSelected(e: any, item: any): void;
    itemBlured(e: any, item: any): void;
    getData(query: any, callback: any): void;
}
