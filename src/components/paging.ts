import Url from 'olive/components/url'
import FormAction from 'olive/mvc/formAction'

export default class Paging implements IService {

    constructor(private url: Url,
        private formAction: FormAction) { }

    public enableOnSizeChanged(selector: JQuery) {
        selector.off("change.pagination-size").on("change.pagination-size", e => this.onSizeChanged(e));
    }

    public enableWithAjax(selector: JQuery) {
        selector.off("click.ajax-paging").on("click.ajax-paging",
            e => this.withAjax(e));
    }

    onSizeChanged(event: Event) {
        let form = $(event.currentTarget).closest("form");
        if (form.length === 0) return;
        if (form.attr("method") == "get") form.submit();
        else {
            let actionUrl = this.url.effectiveUrlProvider(form.attr("action"), $(event.currentTarget));
            this.formAction.invokeWithAjax(event, actionUrl);
        }
    }

    withAjax(event: JQueryEventObject) {
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
