import Url from 'olive/components/url'
import Validate from 'olive/components/validate'
import Waiting from 'olive/components/waiting'
import AjaxRedirect from 'olive/mvc/ajaxRedirect'

export default class Form implements IService {

    constructor(
        private url: Url,
        private validate: Validate,
        private waiting: Waiting,
        private ajaxRedirect: AjaxRedirect
    ) { }

    private currentRequestUrlProvider: (() => string) = () => window.location.pathAndQuery();

    public enableDefaultButtonKeyPress(selector: JQuery) { selector.off("keypress.default-button").on("keypress.default-button", (e) => this.DefaultButtonKeyPress(e)); }

    public enablecleanUpNumberField(selector: JQuery) { selector.off("blur.cleanup-number").on("blur.cleanup-number", (e) => this.cleanUpNumberField($(e.currentTarget))); }

    public enablesubmitCleanGet(selector: JQuery) { selector.off("submit.clean-up").on("submit.clean-up", (e) => this.submitCleanGet(e)); }

    private getCleanFormData(form: JQuery): JQuerySerializeArrayElement[] {
        let result: JQuerySerializeArrayElement[] = [];

        let disabledOnes = form.find(":disabled").removeAttr('disabled')

        let items = form.serializeArray();

        disabledOnes.attr('disabled', 'disabled');

        let groupedByKeys = Array.groupBy(items, i => i.name.toLowerCase());

        for (let i in groupedByKeys) {
            let group = groupedByKeys[i];
            if (typeof (group) == 'function') continue;
            let key = group[0].name;
            let values = group.map(item => item.value).filter(v => v);

            // Fix for MVC checkboxes:
            if ($("input[name='" + key + "']", form).is(":checkbox") && values.length == 2 && values[1] == 'false'
                && (values[0] == 'true' || values[0] == 'false')) values.pop();
            result.push({ name: key, value: values.join("|") });
        }

        // Fix for multi-select:
        // If a multi-select control has no value, we should return empty value for it.
        // The default serializeArray() function just ignores it.
        $("select[multiple]", form).each((i, e) => {
            var key = $(e).attr("name");
            if (result.filter(v => v.name === key).length === 0)
                result.push({ name: key, value: "" });
        });


        return result;
    }

    public cleanJson(str): string {
        return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')
    };

    public getPostData(trigger: JQuery): JQuerySerializeArrayElement[] {
        let form = trigger.closest("[data-module]");
        if (!form.is("form")) form = $("<form />").append(form.clone(true));
        let data = this.getCleanFormData(form);
        // If it's master-details, then we need the index.
        let subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer) {
            data.push({
                name: "subFormIndex",
                value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
            });
        }

        data.push({ name: "current.request.url", value: this.currentRequestUrlProvider() });
        return data;
    }

    private DefaultButtonKeyPress(event: JQueryEventObject): boolean {
        if (event.which === 13) {
            let target = $(event.currentTarget);
            let button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0) button = $('[default-button]:first') // anywhere
            button.click();
            return false;
        } else return true;
    }

    private cleanUpNumberField(field: JQuery) {
        let domElement = <HTMLInputElement>field.get(0);
        field.val(field.val().replace(/[^\d.-]/g, ""));
    }

    private submitCleanGet(event: JQueryEventObject) {
        let form = $(event.currentTarget);
        if (this.validate.validateForm(form) == false) { this.waiting.hide(); return false; }

        let formData = this.getCleanFormData(form).filter(item => item.name != "__RequestVerificationToken");

        let url = this.url.removeEmptyQueries(form.attr('action'));

        try {

            form.find("input:checkbox:unchecked").each((ind, e) => url = this.url.removeQuery(url, $(e).attr("name")));

            for (let item of formData)
                url = this.url.updateQuery(url, item.name, item.value);

            url = this.url.removeEmptyQueries(url);

            if (form.is("[data-redirect=ajax]")) this.ajaxRedirect.go(url, form, false, false, true);
            else location.href = url;
        }
        catch (error) {
            console.log(error);
            alert(error);
        }
        return false;
    }
}
