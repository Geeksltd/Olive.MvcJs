import Waiting from "olive/components/waiting";
import { ModalHelper } from 'olive/components/modal'

export class GlobalSearchFactory implements IService {
    constructor(private waiting: Waiting, private modalHelper: ModalHelper) {
    }

    public enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e), this.waiting, this.modalHelper).enable());
    }
}

export default class GlobalSearch implements IService {
    private urlList: string[];
    private resultItemClass: string;

    private panel: JQuery;
    private helpPanel: JQuery;
    private groupsPanel: JQuery;
    private resultsPanel: JQuery;

    private isTyping: boolean = false;
    private searchedText: string = null;
    private modalHelper: ModalHelper
    private currentAjaxRequests: JQueryXHR[] = [];

    protected boldSearch(str: string, searchText: string) {
        if (!str) return "";
        return str.replace(new RegExp('(' + searchText + ')', "gi"), "<b>$1</b>");
    }

    protected boldSearchAll(str: string, searchText: string) {
        let result: string = str;
        if (searchText) {
            const splitedsearchtext = searchText.split(" ");
            for (const strST of splitedsearchtext) {
                result = this.boldSearch(result, strST);
            }
        }
        return result;
    }

    constructor(private input: JQuery, private waiting: Waiting, modalHelper: ModalHelper) {

        this.modalHelper = modalHelper;

    }

    public enable() {
        if (this.input.is("[data-globalsearch-enabled=true]")) {
            return;
        } else {
            this.input.attr("data-globalsearch-enabled", "true");
        }

        $('#global-search-modal').on('shown.bs.modal', function () {
            $('#global-search-modal .form-control').trigger('focus')
        })

        this.urlList = (this.input.attr("data-search-source") || "").split(";");
        this.resultItemClass = this.input.attr("data-result-item-class");

        this.panel = $("#global-search-modal .global-search-panel")
        this.helpPanel = $("#global-search-modal .global-search-help")
        this.groupsPanel = $("#global-search-modal .global-search-groups")
        this.resultsPanel = $("#global-search-modal .global-search-results")

        let timeout = null;
        this.input.on('keyup', (e) => {
            if (e.keyCode === 27) return;

            this.isTyping = true;
            clearTimeout(timeout);
            timeout = setTimeout((() => {
                this.isTyping = false;
                if (this.searchedText !== this.input.val().trim()) {
                    this.createSearchComponent(this.urlList);
                }
            }), 300);
        });
    }

    protected createSearchComponent(urls: string[]) {
        this.searchedText = this.input.val().trim();

        for (const req of this.currentAjaxRequests) {
            req.abort();
        }
        this.currentAjaxRequests = [];

        this.groupsPanel.empty();
        this.resultsPanel.empty();
        if (this.searchedText) {
            this.helpPanel.hide();
        }
        else {
            this.helpPanel.show();
            return;
        }


        const ajaxList = urls.map((p): IAjaxObject => {
            const icon = p.split("#")[1].trim();
            return {
                url: p.split("#")[0].trim(),
                icon,
                state: AjaxState.pending,
            };
        });

        const context: ISearchContext = {
            ajaxList,
            resultCount: 0,
            groupsPanel: this.groupsPanel,
            resultsPanel: this.resultsPanel,
            beginSearchStarted: true,
            searchedText: this.searchedText,
        };

        if (!context.ajaxList.length) {
            this.resultsPanel.html(
                `<div class='global-search-no-results'>` +
                `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                `</div>`
            );
            return;
        }

        this.resultsPanel.html("<div class='global-search-loading'>Searching...</div>");

        for (const ajaxObject of context.ajaxList) {
            ajaxObject.ajx = $
                .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: (result) => this.onSuccess(ajaxObject, context, result),
                    complete: (jqXhr) => this.onComplete(context, jqXhr),
                    error: (jqXhr) => this.onError(ajaxObject, jqXhr),
                });
            this.currentAjaxRequests.push(ajaxObject.ajx);
        }
    }

    protected onSuccess(sender: IAjaxObject, context: ISearchContext, result: IResultItemDto[]) {
        sender.result = result;

        if (!result?.length) {
            sender.state = AjaxState.failed;
            console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
            return;
        }

        sender.state = AjaxState.success;

        if (this.isTyping) {
            return;
        }

            // Results from GlobalSearch MS have the GroupTitle in their description field separated with $$$
            var resultWithType = result.map(x => {
                if (x.Description === null || x.Description.indexOf("$$$") < 0) {
                    return x;
                }
                var descArray = x.Description.split("$$$");
                var groupTitle = descArray.shift();

                x.GroupTitle = groupTitle;
                x.Description = descArray.join("");

                return x;
            });


            const groupedByResult = this.groupBy(resultWithType, 'GroupTitle');
            let index = 0;
            for (let item in groupedByResult) {
                if (!groupedByResult[item].length) continue;
                this.createSearchItems(sender, context, index++, item, groupedByResult[item]);

                if (context.beginSearchStarted && result.length > 0) {
                    context.beginSearchStarted = false;
                }
            }
    }

    protected isValidResult(item: IResultItemDto, context: ISearchContext) {
        let resfilter = false;
        if (context.searchedText) {
            const arfilter = context.searchedText.split(" ");
            for (const strfilter of arfilter) {
                if ((
                    (
                        item.Description !== null &&
                        item.Description !== undefined &&
                        item.Description.match(new RegExp(strfilter, "gi")) !== null
                    ) ||
                    item.Title.match(new RegExp(strfilter, "gi")) !== null)
                ) {
                    resfilter = true;
                    break;
                }
            }
        } else {
            resfilter = true;
        }
        return resfilter;
    }

    protected createSearchItems(sender: IAjaxObject, context: ISearchContext, groupIndex: number, groupTitle: string, items: IResultItemDto[]) {

        groupTitle = groupTitle || (items?.length > 0 && items[0].GroupTitle?.length > 0) ?
            items[0].GroupTitle : sender.url.split(".")[0]
                .replace("https://", "")
                .replace("http://", "")
                .replace("'", "")
                .replace("\"", "")
                .toUpperCase();

        const id = this.safeId(groupTitle || 'group') + "-" + groupIndex;
        const active = this.groupsPanel.children().length == 0 ? "active" : "";

        const searchTitle = $(`<li class='nav-item'><a class='nav-link ${active}' href='#${id}' role='tab' data-toggle='tab'><i class='${sender.icon}'></i> ${groupTitle || "Global"} <span class='badge badge-secondary'>${items.length}</span></a></li>`)

        // we may need to use the search title to implement show more.
        // but we may only need to add li (show more) at the end of list and after it is clicked,
        // it makes all hidden items visible

        this.groupsPanel.append(searchTitle);
        let childrenItems = $("<div class='row'>");

        const maxResultItemsCount = 100;

        for (let i = 0; i < items.length && i < maxResultItemsCount; i++) {
            context.resultCount++;
            childrenItems.append(this.createItem(items[i], context));
        }

        childrenItems = $("<div role='tabpanel' class='tab-pane " + active + "' id='" + id + "'>").append(childrenItems);

        if (items?.length > 0 && items[0].Colour) {
            childrenItems.css("color", items[0].Colour);
        }

        $(childrenItems).find("[target='$modal'][href]").off("click").on("click", function () {
            $('#global-search-modal').modal('hide')
        });
        this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));

        this.resultsPanel.append(childrenItems);
    }

    safeId(title: string) {
        return title.replace(/[^a-zA-Z0-9]/g, '_')
    }

    protected createItem(item: IResultItemDto, context: ISearchContext) {
        var attr = "";
        if (item.Action == ActionEnum.Popup)
            attr = "target=\"$modal\"";
        else if (item.Action == ActionEnum.NewWindow)
            attr = "target=\"_blank\"";

        return $(
            `<div class='${this.resultItemClass}'>` +
            `<div class='search-item'>` +
            `<div class='icon'>` +
            `<a name='Photo' class='profile-photo' href='${item.Url}'>` +
            (!item.IconUrl ? "<div class='icon'></div>" : this.showIcon(item)) +
            `</a>` +
            `</div>` +
            `<div class='result-item-content'>` +
            `<div class='type'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.GroupTitle, context.searchedText)}</a></div>` +
            `<div class='title'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Title, context.searchedText)}</a></div>` +
            `<div class='body'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Description, context.searchedText)}</a></div>` +
            `</div>` +
            `</div>` +
            `</div>`);

    }

    protected onComplete(context: ISearchContext, jqXHR: JQueryXHR) {
        if (context.ajaxList.filter((p) => p.state === 0).length === 0) {
            context.resultsPanel.find('.global-search-loading').remove();
            if (context.resultCount === 0) {
                context.resultsPanel.html(
                    `<div class='global-search-no-results'>` +
                    `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                    `</div>`
                );
            }
        }
    }

    protected onError(sender: IAjaxObject, jqXHR: JQueryXHR) {
        sender.state = AjaxState.failed;
        // this.resultsPanel.append($("ajax failed Loading data from source [" + sender.url + "]"));
        console.error(jqXHR);
    }

    protected showIcon(item: any): string {
        if (item.IconUrl.indexOf("fa-") > 0) {
            return `<span class='icon-background' style='background-color: ${item.Colour}'><span class='${item.IconUrl}'></span></span>`;
        }
        else {
            return `<img src='${item.IconUrl}' />`;
        }
    }

    protected groupBy(array: IResultItemDto[], key: string): IResultGroupDto {
        return array.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }
}

export enum AjaxState {
    pending,
    success,
    failed,
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
    [key: string]: IResultItemDto[]
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

export enum ActionEnum {
    Redirect,
    Popup,
    NewWindow,
}