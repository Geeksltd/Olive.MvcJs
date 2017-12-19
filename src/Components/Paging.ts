export default class Paging {

    public static onSizeChanged(event: Event) {
        $(event.currentTarget).closest("form").submit();
    }

    public static enableWithAjax(event: JQueryEventObject) {
        let button = $(event.currentTarget);
        let page = button.attr("data-pagination");
        let key = "p";

        if (page.split('=').length > 1) { key = page.split('=')[0]; page = page.split('=')[1]; }

        let input = $("[name='" + key + "']");
        input.val(page);
        if (input.val() != page) {
            // Drop down list case
            input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
            input.remove();
        }
    }
}
