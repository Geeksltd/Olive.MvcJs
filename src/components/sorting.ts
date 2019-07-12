
import Url from 'olive/components/url'
// import FormAction from 'olive/mvc/formAction'
import 'jquery-sortable'
import CombinedUtilities from 'olive/mvc/combinedUtilities';

export default class Sorting implements IService {

    constructor(private url: Url,
        private formAction: CombinedUtilities) { }

    public enableDragSort(selector: JQuery) { selector.each((i, e) => this.DragSort($(e))) };

    public enablesetSortHeaderClass(selector: JQuery) { selector.each((i, e) => this.setSortHeaderClass($(e))) };

    public enableAjaxSorting(selector: JQuery) {
        selector.off("click.ajax-sorting").on("click.ajax-sorting", e => this.AjaxSorting(e))
    };

    private AjaxSorting(event: JQueryEventObject) {
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

    public setSortHeaderClass(thead: JQuery) {

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

    private DragSort(container) {

        var config = {
            handle: '[data-sort-item]',
            containment: "parent",
            axis: 'y',
            tolerance: "pointer",
            scroll: true,
        }

        var itemsSelector = "> li";
        if (container.is("tbody")) {
            itemsSelector = "> tr";
        } else if (container.is(".r-grid-body")) {
            itemsSelector = "> .r-grid-row";
            delete config.axis;
        }

        config["items"] = itemsSelector;

        config["helper"] = (e, ui) => {
            // prevent TD collapse during drag
            ui.children().each((i, c) => $(c).width($(c).width()));
            return ui;
        };
        config["stop"] = (e, ui) => {

            $(ui).children().removeAttr("style");
            container.find(itemsSelector).children().removeAttr("style");

            let dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";

            let handle = ui.item.find("[data-sort-item]");

            let actionUrl = handle.attr("data-sort-action");
            actionUrl = this.url.addQuery(actionUrl, "drop-before", dropBefore);

            actionUrl = this.url.effectiveUrlProvider(actionUrl, handle);

            this.formAction.invokeWithAjax_fa({ currentTarget: handle.get(0) }, actionUrl);
        };


        container.sortable(config);
    }

}
