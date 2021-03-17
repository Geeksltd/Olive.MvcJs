import ServerInvoker from 'olive/mvc/serverInvoker';
import Url from 'olive/components/url'

export default class Paging implements IService {

    constructor(private url: Url,
        private serverInvoker: ServerInvoker) { }

    public enableOnSizeChanged(selector: JQuery) {
        selector.off("change.pagination-size").on("change.pagination-size", e => this.onSizeChanged(e));
    }

    public enableWithAjax(selector: JQuery) {
        selector.off("click.ajax-paging").on("click.ajax-paging",
            e => this.withAjax(e));
    }

    private onSizeChanged(event: JQueryEventObject) {
        const form = $(event.currentTarget).closest("form");
        if (form.length === 0) return;
        if (form.attr("method") === "get") form.submit();
        else {
            const actionUrl = this.url.effectiveUrlProvider(form.attr("action"), $(event.currentTarget));
            this.serverInvoker.invokeWithAjax(event, actionUrl);
        }
    }

    private withAjax(event: JQueryEventObject) {
        const button = $(event.currentTarget);
        let page = button.attr("data-pagination");
        let key = "p";

        if (page.split('=').length > 1) { key = page.split('=')[0]; page = page.split('=')[1]; }

        const input = $("[name='" + key + "']");
        input.val(page);
        if (input.val() !== page) {
            // Drop down list case
            input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
            input.remove();
        }
    }
}
