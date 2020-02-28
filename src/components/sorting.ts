
import Url from "olive/components/url";
import "jquery-sortable";
import ServerInvoker from "olive/mvc/serverInvoker";

export default class Sorting implements IService {

    constructor(
        private url: Url,
        private serverInvoker: ServerInvoker) { }

    public enableDragSort(selector: JQuery) { selector.each((i, e) => this.DragSort($(e))); }

    public enablesetSortHeaderClass(selector: JQuery) { selector.each((i, e) => this.setSortHeaderClass($(e))); }

    public enableAjaxSorting(selector: JQuery) {
        selector.off("click.ajax-sorting").on("click.ajax-sorting", (e) => this.AjaxSorting(e));
    }

    private AjaxSorting(event: JQueryEventObject) {
        const button = $(event.currentTarget);
        let sort = button.attr("data-sort");
        let key = "s";

        if (sort.split("=").length > 1) {
            key = sort.split("=")[0];
            sort = sort.split("=")[1];
        }

        const input = $("[name='" + key + "']");
        if (input.val() === sort) { sort += ".DESC"; }
        input.val(sort);
    }

    public setSortHeaderClass(thead: JQuery) {

        const currentSort: string = thead.closest("[data-module]").find("#Current-Sort").val() || "";
        if (currentSort === "") { return; }

        const sortKey = currentSort.replace(".DESC", "").replace(".ASC", "");

        const currentThead = $("[data-sort='" + sortKey + "']");

        if (currentSort.contains(".DESC")) {
            currentThead.removeClass("sort-ascending");
            currentThead.addClass("sort-descending");
        } else {
            currentThead.removeClass("sort-descending");
            currentThead.addClass("sort-ascending");
        }

        currentThead.append("<i />");
    }

    private DragSort(container) {

        const itemsSelector = "> li";

        const config = {
            handle: "[data-sort-item]",
            containment: "parent",
            axis: "y",
            tolerance: "pointer",
            scroll: true,
            items: itemsSelector,
            helper: (e, ui) => {
                // prevent TD collapse during drag
                ui.children().each((i, c) => $(c).width($(c).width()));
                return ui;
            },
            stop: (e, ui) => {

                $(ui).children().removeAttr("style");
                container.find(itemsSelector).children().removeAttr("style");

                const dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";

                const handle = ui.item.find("[data-sort-item]");

                let actionUrl = handle.attr("data-sort-action");
                actionUrl = this.url.addQuery(actionUrl, "drop-before", dropBefore);

                actionUrl = this.url.effectiveUrlProvider(actionUrl, handle);

                this.serverInvoker.invokeWithAjax({ currentTarget: handle.get(0) } as JQueryEventObject, actionUrl);
            },
        };

        if (container.is("tbody")) {
            config.items = "> tr";
        } else if (container.is(".r-grid-body")) {
            config.items = "> .r-grid-row";
            delete config.axis;
        }

        container.sortable(config);
    }

}
