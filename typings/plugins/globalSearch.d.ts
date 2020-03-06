import Waiting from "olive/components/waiting";
export declare class GlobalSearchFactory implements IService {
    private waiting;
    constructor(waiting: Waiting);
    enable(selector: JQuery): void;
}
export default class GlobalSearch implements IService {
    private input;
    private waiting;
    private urlList;
    private isMouseInsideSearchPanel;
    private isTyping;
    private searchedText;
    protected boldSearch(str: string, searchText: string): string;
    protected boldSearchAll(str: string, searchText: string): string;
    constructor(input: JQuery, waiting: Waiting);
    enable(): void;
    protected clearSearchComponent(): void;
    protected getResultPanel(): JQuery;
    protected createSearchComponent(urls: string[]): void;
    protected onSuccess(sender: IAjaxObject, context: ISearchContext, result: IResultItemDto[]): void;
    protected isValidResult(item: IResultItemDto, context: ISearchContext): boolean;
    protected createSearchItems(sender: IAjaxObject, context: ISearchContext, items: IResultItemDto[]): JQuery;
    protected createItem(item: IResultItemDto, context: ISearchContext): JQuery;
    protected onComplete(context: ISearchContext, jqXHR: JQueryXHR): void;
    protected onError(sender: IAjaxObject, resultPanel: JQuery, jqXHR: JQueryXHR): void;
    protected showIcon(item: any): JQuery;
}
export declare enum AjaxState {
    pending = 0,
    success = 1,
    failed = 2
}
export interface ISearchContext {
    ajaxList: IAjaxObject[];
    resultPanel: JQuery;
    resultCount: number;
    searchHolder: JQuery;
    beginSearchStarted: boolean;
    searchedText: string;
}
export interface IResultItemDto {
    Title: string;
    Description: string;
    IconUrl: string;
    Url: string;
    Colour: string;
    GroupTitle: string;
}
export interface IAjaxObject {
    url: string;
    icon: string;
    state: AjaxState;
    ajx?: JQueryXHR;
    displayMessage?: string;
    result?: IResultItemDto[];
}
