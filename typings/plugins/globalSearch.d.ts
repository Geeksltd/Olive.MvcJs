export default class GlobalSearch {
    private input;
    private awaitingAutocompleteResponses;
    private valueField;
    private testvarable;
    private urlList;
    private isMouseInsideSearchPanel;
    private isTyping;
    private searchedText;
    static enable(selector: JQuery): void;
    private static boldSearch;
    private static boldSearchAll;
    constructor(input: JQuery);
    private enable;
    private inputChangeHandler;
    private clearSearchComponent;
    private createSearchComponent;
    private static showIcon;
    private clearValue;
    private itemSelected;
    private toObject;
}
