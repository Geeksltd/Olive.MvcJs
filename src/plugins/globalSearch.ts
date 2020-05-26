import Waiting from "olive/components/waiting";

export class GlobalSearchFactory implements IService {
    constructor(private waiting: Waiting) {
    }

    public enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e), this.waiting).enable());
    }
}

export default class GlobalSearch implements IService {
    private urlList: string[];
    private isMouseInsideSearchPanel: boolean = false;
    private isTyping: boolean = false;
    private searchedText: string = null;

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

    constructor(private input: JQuery, private waiting: Waiting) { }

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
    }

    protected clearSearchComponent() {
        const inputholder = this.input.parent();
        if (inputholder !== undefined) {
            const panel = inputholder.find(".global-search-result-panel");
            if (panel !== undefined) {
                panel.empty();
                panel.remove();
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
            resultPanel.show();
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

                const resultfiltered = result.filter((p) => this.isValidResult(p, context));

                const searchItem = this.createSearchItems(sender, context, resultfiltered);
                context.searchHolder.append(searchItem);

                if (context.beginSearchStarted && resultfiltered.length > 0) {
                    context.beginSearchStarted = false;
                    context.resultPanel.append(context.searchHolder);
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
            searchTitleHolder.css("color", items[0].Colour);
        }

        const searhTitle = searchTitleHolder.append($("<i>").attr("class", sender.icon)).append(groupTitle);

        searchItem.append(searhTitle);

        const childrenItems = $("<ul>");

        for (let i = 0; i < items.length && i < 10; i++) {
            context.resultCount++;
            childrenItems.append(this.createItem(items[i], context));
        }

        searchItem.append(childrenItems);

        if (items.length === 0) {
            searchItem.addClass("d-none");
        }

        return searchItem;
    }

    protected createItem(item: IResultItemDto, context: ISearchContext) {
        return $("<li>")
            .append((item.IconUrl === null || item.IconUrl === undefined) ?
                $("<div class='icon'>") : this.showIcon(item))
            .append($("<a href='" + item.Url + "'>")
                .html(this.boldSearchAll(item.Title, context.searchedText)))
            .append($(" <div class='desc'>").html(item.Description));
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
            return $("<div class='icon'>").append($("<i class='" + item.IconUrl + "'></i>"));
        } else {
            return $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>"));
        }
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
}

export interface IAjaxObject {
    url: string;
    icon: string;
    state: AjaxState;
    ajx?: JQueryXHR;
    displayMessage?: string;
    result?: IResultItemDto[];
}
