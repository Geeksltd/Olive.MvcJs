import Url from 'olive/Components/Url'
import FormAction from 'olive/Components/FormAction'

export default class Sorting {

    public static enableAjaxSorting(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var sort = button.attr("data-sort");
        var key = "s";

        if (sort.split('=').length > 1) {
            key = sort.split('=')[0];
            sort = sort.split('=')[1];
        }

        var input = $("[name='" + key + "']");
        if (input.val() == sort) sort += ".DESC";
        input.val(sort);
    }

    public static setSortHeaderClass(thead: JQuery) {
        var currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
        if (currentSort == "") return;

        var sortKey = thead.attr('data-sort');
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

        var isTable = container.is("tbody");
        var items = isTable ? "> tr" : "> li"; // TODO: Do we need to support any other markup?

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

                var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";

                var handle = ui.item.find("[data-sort-item]");

                var actionUrl = handle.attr("data-sort-action");
                actionUrl = Url.addQuery(actionUrl, "drop-before", dropBefore);

                FormAction.invokeWithAjax(null/*{ currentTarget: handle.get(0) }*/, actionUrl, null, null);
            }
        });
    }
}