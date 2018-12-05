export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    testvarable: number;
    urlList: string[];
    isMouseInsideSearchPanel: boolean;
    isTyping: boolean;
    searchedText: string;
    static enable(selector: JQuery): void;
    static boldSearch(str: string, searchText: string): string;
    static boldSearchAll(str: string, searchText: string): string;
    constructor(targetInput: any);
    enable(): void;
    inputChangeHandler(): void;
    clearSearchComponent(): void;
    createSearchComponent(urls: string[]): void;
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
