export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    urlList: string[];
    isMouseInsideSearchPanel: boolean;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    clearSearchComponent(): void;
    createSearchComponent(urls: string[]): void;
    createTypeaheadSettings(urls: string[]): {
        maxItem: number;
        minLength: number;
        delay: number;
        dynamic: boolean;
        backdrop: boolean;
        correlativeTemplate: boolean;
        emptyTemplate: string;
        display: string;
        template: string;
        href: string;
        source: {};
        callback: {
            onNavigateAfter: (node: any, lis: any, a: any, item: any, query: any, event: any) => void;
            onClickAfter: (node: any, a: any, item: any, event: any) => void;
            onResult: (node: any, query: any, result: any, resultCount: any) => void;
            onMouseEnter: (node: any, a: any, item: any, event: any) => void;
            onMouseLeave: (node: any, a: any, item: any, event: any) => void;
        };
    };
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
