export default class Paging {

    public static onSizeChanged(event: Event) {
        $(event.currentTarget).closest("form").submit();
    }

    public static enableWithAjax(event: JQueryEventObject) {
        var button = $(event.currentTarget);
        var page = button.attr("data-pagination");
        var key = "p";

        if (page.split('=').length > 1) { key = page.split('=')[0]; page = page.split('=')[1]; }

        var input = $("[name='" + key + "']");
        input.val(page);
        if (input.val() != page) {
            // Drop down list case
            input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
            input.remove();
        }
    }
}