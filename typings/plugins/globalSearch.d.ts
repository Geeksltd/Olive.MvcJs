export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    testvarable: number;
    urlList: string[];
    isMouseInsideSearchPanel: boolean;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    inputChangeHandler(): void;
    clearSearchComponent(): void;
    createSearchComponent(urls: string[]): void;
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
