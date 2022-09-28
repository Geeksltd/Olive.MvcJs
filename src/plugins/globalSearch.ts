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
    private isMouseInsideSearchPanel: boolean = false;
    private isTyping: boolean = false;
    private searchedText: string = null;
    private modalHelper: ModalHelper

    protected boldSearch(str: string, searchText: string) {
        let ix = -1;
        let result: string = "";
        if (str !== null && str !== undefined) {
            str = str.replace(/<strong>/gi, "↨↨").replace(/<\/strong>/gi, "↑↑");

            const strlower = str.toLowerCase();
            if (searchText !== "" && searchText !== null && searchText !== undefined) {
                const stxt = searchText.toLowerCase();
                do {
                    const ixNext = strlower.indexOf(stxt, ix);

                    if (ixNext < 0) { break; }

                    if (ix < 0) { result = str.substr(0, ixNext); }

                    result += (ix >= 0 ? str.substr(ix, ixNext - ix) : "") +
                        "<strong>" +
                        str.substr(ixNext, stxt.length) + "</strong>";

                    ix = ixNext + stxt.length;
                } while (true);
            }
            result += (ix < 0 ? str : str.substr(ix, str.length - ix));

            result = result.replace(/↨↨/gi, "<strong>").replace(/↑↑/gi, "</strong>");
        }
        return result;
    }

    protected boldSearchAll(str: string, searchText: string) {
        let result: string = str;
        if (searchText !== null && searchText !== undefined) {
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

        this.input.wrap("<div class='global-search-panel'></div>");

        const urlsList = (this.input.attr("data-search-source") || "").split(";");
        this.urlList = urlsList;

        let timeout = null;
        this.input.keyup((e) => {

            if (e.keyCode === 27) {
                return;
            }

            this.isTyping = true;
            clearTimeout(timeout);
            timeout = setTimeout((() => {
                this.isTyping = false;
                if (this.searchedText !== this.input.val().trim()) {
                    this.createSearchComponent(this.urlList);
                }
            }), 300);
        });

        this.input.on("blur", ((e) => {
            if (this.isMouseInsideSearchPanel === false) {
                this.clearSearchComponent();
            }
        }));
        this.input.on("focus", ((e) => {
            const inputholder = this.input.parent();
            const panel = inputholder.find(".global-search-result-panel");
            if (panel.children().length > 0)
                panel.show();
        }));
    }

    protected clearSearchComponent() {
        const inputholder = this.input.parent();
        if (inputholder !== undefined) {
            const panel = inputholder.find(".global-search-result-panel");
            if (panel !== undefined) {
                panel.fadeOut('fast');
                // panel.empty();
                // panel.remove();
            }
        }
    }

    protected getResultPanel() {
        const searchPanel = this.input.parent();
        let resultPanel = searchPanel.find(".global-search-result-panel");

        if (resultPanel === undefined || resultPanel === null || resultPanel.length === 0) {
            resultPanel = $("<div class='global-search-result-panel'>")
                .mouseenter(() => this.isMouseInsideSearchPanel = true)
                .mouseleave(() => this.isMouseInsideSearchPanel = false);
            searchPanel.append(resultPanel);
        }
        else {
            resultPanel.empty().show();
        }

        $(window).on("keydown", (e) => {
            if (e.keyCode === 27) {
                resultPanel.hide(null, () => {
                    $(window).off("keydown");
                });
                $('input[name=searcher]').val('');
            }
        });

        return resultPanel;
    }

    protected createSearchComponent(urls: string[]) {
        this.searchedText = this.input.val().trim();

        const resultPanel = this.getResultPanel();
        resultPanel.empty();

        const searchHolder = $("<div class='search-container'>");

        this.waiting.show();

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
            resultPanel,
            searchHolder,
            beginSearchStarted: true,
            searchedText: this.searchedText,
        };

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
                    error: (jqXhr) => this.onError(ajaxObject, resultPanel, jqXhr),
                });
        }
    }

    protected onSuccess(sender: IAjaxObject, context: ISearchContext, result: IResultItemDto[]) {
        if (this.isTyping === false) {
            sender.result = result;
            if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                sender.state = AjaxState.success;

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

                for (let item in groupedByResult) {


                    var searchItem = this.createSearchItems(sender, context, groupedByResult[item]);
                    context.searchHolder.append(searchItem);


                    if (context.beginSearchStarted && result.length > 0) {
                        context.beginSearchStarted = false;
                        context.resultPanel.append(context.searchHolder);
                    }

                }

            } else {
                sender.state = AjaxState.failed;
                console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
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

    protected createSearchItems(sender: IAjaxObject, context: ISearchContext, items: IResultItemDto[]) {
        const searchItem = $("<div class='search-item'>");

        const groupTitle = (items?.length > 0 && items[0].GroupTitle?.length > 0) ? items[0].GroupTitle : sender.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();

        const searchTitleHolder = $("<div class='search-title'>");

        if (items?.length > 0 && items[0].Colour) {
            searchItem.css("color", items[0].Colour);
            //searchTitleHolder.css("color", items[0].Colour);
        }

        const searhTitle = searchTitleHolder.append($("<i>").attr("class", sender.icon)).append(groupTitle);

        // we may need to use the search title to implement show more.
        // but we may only need to add li (show more) at the end of list and after it is clicked,
        // it makes all hidden items visible


        searchItem.append(searhTitle);

        const childrenItems = $("<ul>");

        const resultItemsCount = 100;

        for (let i = 0; i < items.length && i < resultItemsCount; i++) {
            context.resultCount++;
            childrenItems.append(this.createItem(items[i], context));
        }
        
        if(childrenItems.children('li').length > 5)
        {
            const removeExceededItems = () => {
                childrenItems.children('li').each(function (index, element) {

                    if (index < 5) {
                        return;
                    }

                    $(element).css('display', 'none');

                });
            }

            removeExceededItems();

            const showMoreClass = 'show-more';

            const showMoreItem = $("<li class='show-toggle'>").html("Show more");
            showMoreItem.addClass(showMoreClass);

            childrenItems.append(showMoreItem);

            showMoreItem.click(()=>{
               if (showMoreItem.hasClass(showMoreClass)) {
                        showMoreItem.siblings().css("display", "list-item");
                        
                        showMoreItem.toggleClass(showMoreClass)
                        showMoreItem.html("Show less");
                    }
                    else {
                        removeExceededItems();

                        showMoreItem.toggleClass(showMoreClass);
                        showMoreItem.css("display", "list-item");
                        showMoreItem.html("Show more");
                    }
            })
        }

        $(childrenItems).find("[target='$modal'][href]").off("click").click(function () {
            $(".global-search-result-panel").fadeOut();
        });
        this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));

        searchItem.append(childrenItems);

        if (items.length === 0) {
            searchItem.addClass("d-none");
        }

        return searchItem;
    }

    protected createItem(item: IResultItemDto, context: ISearchContext) {
        var attr = "";
        if (item.Action == ActionEnum.Popup)
            attr = "target=\"$modal\"";
        else if (item.Action == ActionEnum.NewWindow)
            attr = "target=\"_blank\"";

            return $("<li>")
                .append($("<div class='result-item'>")
                    .append($("<p class='icon'>")
                        .append($(`<a name = 'Photo' class='profile-photo' href='${item.Url}'>`)
                            .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : this.showIcon(item))
                        ))
                    .append($("<div class='result-item-content'>")
                        .append($("<p class='type'>")
                            .append($(`<a href='${item.Url}' ${attr}>`).html(this.boldSearchAll(item.GroupTitle, context.searchedText))))
                        .append($("<p class='title'>")
                            .append($(`<a href='${item.Url}' ${attr}>`).html(this.boldSearchAll(item.Title, context.searchedText))))
                        .append($("<p class='body'>")
                            .append($(`<a href='${item.Url}' ${attr}>`).html(this.boldSearchAll(item.Description, context.searchedText)))))
                );

    }

    protected onComplete(context: ISearchContext, jqXHR: JQueryXHR) {
        if (context.ajaxList.filter((p) => p.state === 0).length === 0) {
            this.waiting.hide();
            if (context.resultCount === 0) {
                const ulNothing = $("<ul>");
                ulNothing.append("<li>").append("<span>").html("Nothing found");
                context.resultPanel.append(ulNothing);
            }
        }
    }

    protected onError(sender: IAjaxObject, resultPanel: JQuery, jqXHR: JQueryXHR) {
        sender.state = AjaxState.failed;

        const ulFail = $("<ul>");
        ulFail.append($("<li>").append($("<span>")
            .html("ajax failed Loading data from source [" + sender.url + "]")));
        resultPanel.append(ulFail);
        console.error(jqXHR);
    }

    protected showIcon(item: any): JQuery {
        if (item.IconUrl.indexOf("fa-") > 0) {
            return $(`<span class='icon-background' style = 'background-color: ${item.Colour}'>`)
                .append($(`<span class='${item.IconUrl}' >`));
        }
        else {
            return $(`<img src='${item.IconUrl}' />`);
        }
    }

    protected groupBy(array: any, key: any){
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

export enum ActionEnum {
    Redirect,
    Popup,
    NewWindow,
}