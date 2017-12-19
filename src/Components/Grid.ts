export default class Grid {

    public static applyColumns(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let checkboxes = button.closest(".select-cols").find(":checkbox");
        if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0) return;
        $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
            .appendTo(button.parent());
    }

    public static enableSelectColumns(container) {
        let columns = container.find("div.select-cols");
        container.find("a.select-cols").click(() => { columns.show(); return false; });
        columns.find('.cancel').click(() => columns.hide());
    }

    public static enableSelectAllToggle(event) {
        let trigger = $(event.currentTarget);
        trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
    }

    public static highlightRow(element: any) {
        let target = $(element.closest("tr"));
        target.siblings('tr').removeClass('highlighted');
        target.addClass('highlighted');
    }
}
