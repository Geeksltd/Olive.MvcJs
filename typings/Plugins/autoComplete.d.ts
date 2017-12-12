export declare class AutoComplete {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    constructor(targetInput: any);
    handle(): void;
    clearValue(e: any): void;
    itemSelected(e: any, item: any): void;
    itemBlured(e: any, item: any): void;
    getData(query: any, callback: any): void;
}
