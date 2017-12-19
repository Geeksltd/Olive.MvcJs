import Url from 'olive/Components/Url'
import FormAction from 'olive/Mvc/FormAction'

export default class Sorting {

    public static enableAjaxSorting(event: JQueryEventObject) {
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

    public static setSortHeaderClass(thead: JQuery) {
        let currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
        if (currentSort == "") return;

        let sortKey = thead.attr('data-sort');
        if (sortKey == currentSort && !thead.hasClass('sort-ascending')) {
            thead.addClass("sort-ascending");
            thead.append("<i />");
        }
        else if (currentSort == sortKey + ".DESC" && !thead.hasClass('sort-descending')) {
            thead.addClass("sort-descending");
            thead.append("<i />");
        }
    }

    public static enableDragSort(container) {

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

                FormAction.invokeWithAjax(null/*{ currentTarget: handle.get(0) }*/, actionUrl);
            }
        });
    }
}
