import Waiting from "olive/components/waiting";
import { ModalHelper } from 'olive/components/modal';
export declare class GlobalSearchFactory implements IService {
    private waiting;
    private modalHelper;
    constructor(waiting: Waiting, modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class GlobalSearch implements IService {
    private input;
    private waiting;
    private urlList;
    private isMouseInsideSearchPanel;
    private isTyping;
    private searchedText;
    private modalHelper;
    protected boldSearch(str: string, searchText: string): string;
    protected boldSearchAll(str: string, searchText: string): string;
    constructor(input: JQuery, waiting: Waiting, modalHelper: ModalHelper);
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
    protected groupBy(array: any, key: any): any;
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
    Action: ActionEnum;
}
export interface IAjaxObject {
    url: string;
    icon: string;
    state: AjaxState;
    ajx?: JQueryXHR;
    displayMessage?: string;
    result?: IResultItemDto[];
}
export declare enum ActionEnum {
    Redirect = 0,
    Popup = 1,
    NewWindow = 2
}
