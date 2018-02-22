
export default class Grid {


    public static enableColumn(element: any) {
        element.off("click.apply-columns").on("click.apply-columns", e => this.applyColumns(e));
    }

    public static enableToggle(element: any) {
        element.off("click.select-all").on("click.select-all", e => this.enableSelectAllToggle(e));
    }

    public static enableHlightRow(element: any) {
        this.highlightRow(element);
    }

    public static enableSelectCol(selector: JQuery) {
        selector.each((i, e) => this.enableSelectColumns($(e)));
    }


    static applyColumns(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
    }

    static enableSelectColumns(container) {
        let columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    static enableSelectAllToggle(event) {
        let trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    static highlightRow(element: any) {
        let target = $(element.closest("tr"));
        target.siblings('tr').removeClass('highlighted');
        target.addClass('highlighted');
    }
}

