export default class AutoComplete {
    private static customOptions;
    input: JQuery;
    awaitingAutocompleteResponses: number;
    valueField: JQuery;
    static setOptions(options: RunningCoder.Typeahead.Options): void;
    static enable(selector: JQuery): void;
    constructor(targetInput: JQuery);
    enable(): void;
    clearValue(): void;
    itemSelected(item: any): void;
    toObject(arr: JQuerySerializeArrayElement[]): {};
}
