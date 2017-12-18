export default class Form {
    static merge(items: JQuerySerializeArrayElement[]): JQuerySerializeArrayElement[] {
        var result: JQuerySerializeArrayElement[] = [];

        var a: any = Array;

        var groupedByKeys = a.groupBy(items, i => i.name.toLowerCase());

        for (var i in groupedByKeys) {

            var group = groupedByKeys[i];

            if (typeof (group) == 'function') continue;

            var key = group[0].name;

            var values = group.map(item => item.value).filter((v) => v);

            // Fix for MVC checkboxes:
            if ($("input[name='" + key + "']").is(":checkbox") && values.length == 2 && values[1] == 'false'
                && (values[0] == 'true' || values[0] == 'false')) values.pop();

            result.push({ name: key, value: values.join("|") });
        }

        return result;
    }

    static cleanJson(str): string {
        return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":')
    };

    public static getPostData(trigger: JQuery): JQuerySerializeArrayElement[] {
        var form = trigger.closest("[data-module]");
        if (!form.is("form")) form = $("<form />").append(form.clone(true));
        var data = Form.merge(form.serializeArray());
        // If it's master-details, then we need the index.
        var subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer != null) {
            data.push({
                name: "subFormIndex",
                value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
            });
        }

        data.push({ name: "current.request.url", value: window.location.pathAndQuery() });
        return data;
    }

    public static onDefaultButtonKeyPress(event: JQueryEventObject): boolean {
        if (event.which === 13) {
            var target = $(event.currentTarget);
            var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
            if (button.length == 0) button = $('[default-button]:first') // anywhere
            button.click();
            return false;
        } else return true;
    }

    public static cleanUpNumberField(field: JQuery) {
        var domElement = <HTMLInputElement>field.get(0);
        field.val(field.val().replace(/[^\d.-]/g, ""));
    }
}