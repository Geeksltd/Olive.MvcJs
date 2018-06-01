
import Url from 'olive/components/url'
import FormAction from 'olive/mvc/formAction'

export default class Sorting {

    public static enableDragSort(selector: JQuery) { selector.each((i, e) => this.DragSort($(e))) };

    public static enablesetSortHeaderClass(selector: JQuery) { selector.each((i, e) => this.setSortHeaderClass($(e))) };

    public static enableAjaxSorting(selector: JQuery) {
        selector.off("click.ajax-sorting").on("click.ajax-sorting", e => this.AjaxSorting(e))
    };

    static AjaxSorting(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let sort = button.attr("data-sort");
        let key = "s";

        if (sort.split('=').length > 1) {
            key = sort.split('=')[0];
            sort = sort.split('=')[1];
        }

        let input = $("[name='" + key + "']");
        if (input.val() == sort) sort += ".DESC";
        input.val(sort);
    }

    static setSortHeaderClass(thead: JQuery) {

        let currentSort: string = thead.closest("[data-module]").find("#Current-Sort").val() || "";
        if (currentSort == "") return;

        let sortKey = currentSort.replace(".DESC", "").replace(".ASC", "");

        let currentThead = $("[data-sort='" + sortKey + "']");

        if (currentSort.contains(".DESC")) {
            currentThead.removeClass("sort-ascending");
            currentThead.addClass("sort-descending");
        }
        else {
            currentThead.removeClass("sort-descending");
            currentThead.addClass("sort-ascending");
        }

        currentThead.append("<i />");
    }

    static DragSort(container) {

        let isTable = container.is("tbody");
        let items = isTable ? "> tr" : "> li"; // TODO: Do we need to support any other markup?

        container.sortable({
            handle: '[data-sort-item]',
            items: items,
            containment: "parent",
            axis: 'y',
            helper: (e, ui) => {
                // prevent TD collapse during drag
                ui.children().each((i, c) => $(c).width($(c).width()));
                return ui;
            },
            stop: (e, ui) => {

                let dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";

                let handle = ui.item.find("[data-sort-item]");

                let actionUrl = handle.attr("data-sort-action");
                actionUrl = Url.addQuery(actionUrl, "drop-before", dropBefore);

                FormAction.invokeWithAjax({ currentTarget: handle.get(0) }, actionUrl);
            }
        });
    }
}
