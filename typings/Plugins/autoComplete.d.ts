export default class AutoComplete {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    clearValue(): void;
    itemSelected(item: any): void;
    itemBlured(): void;
    getData(query: any, callback: any): void;
}
