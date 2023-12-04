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
    private resultItemClass;
    private panel;
    private helpPanel;
    private groupsPanel;
    private resultsPanel;
    private isTyping;
    private searchedText;
    private modalHelper;
    protected boldSearch(str: string, searchText: string): string;
    protected boldSearchAll(str: string, searchText: string): string;
    constructor(input: JQuery, waiting: Waiting, modalHelper: ModalHelper);
    enable(): void;
    protected createSearchComponent(urls: string[]): void;
    protected onSuccess(sender: IAjaxObject, context: ISearchContext, result: IResultItemDto[]): void;
    protected isValidResult(item: IResultItemDto, context: ISearchContext): boolean;
    protected createSearchItems(sender: IAjaxObject, context: ISearchContext, groupIndex: number, groupTitle: string, items: IResultItemDto[]): void;
    protected createItem(item: IResultItemDto, context: ISearchContext): JQuery;
    protected onComplete(context: ISearchContext, jqXHR: JQueryXHR): void;
    protected onError(sender: IAjaxObject, jqXHR: JQueryXHR): void;
    protected showIcon(item: any): string;
    protected groupBy(array: IResultItemDto[], key: string): IResultGroupDto;
}
export declare enum AjaxState {
    pending = 0,
    success = 1,
    failed = 2
}
export interface ISearchContext {
    ajaxList: IAjaxObject[];
    groupsPanel: JQuery;
    resultsPanel: JQuery;
    resultCount: number;
    beginSearchStarted: boolean;
    searchedText: string;
}
export interface IResultGroupDto {
    [key: string]: IResultItemDto[];
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
