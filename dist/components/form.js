define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Form {
        constructor(url, validate, waiting, ajaxRedirect) {
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.currentRequestUrlProvider = () => window.location.pathAndQuery();
        }
        enableDefaultButtonKeyPress(selector) { selector.off("keypress.default-button").on("keypress.default-button", (e) => this.DefaultButtonKeyPress(e)); }
        enablecleanUpNumberField(selector) {
            selector.off("blur.cleanup-number")
                .on("blur.cleanup-number", (e) => this.cleanUpNumberField($(e.currentTarget)));
        }
        enablesubmitCleanGet(selector) {
            selector.off("submit.clean-up").on("submit.clean-up", (e) => this.submitCleanGet(e));
        }
        getCleanFormData(form) {
            const result = [];
            const disabledOnes = form.find(":disabled").removeAttr("disabled");
            const items = form.serializeArray();
            disabledOnes.attr("disabled", "disabled");
            const groupedByKeys = Array.groupBy(items, (i) => i.name.toLowerCase());
            const numericInputs = new Array();
            form.find("[data-val-range]").map((i, e) => numericInputs.push(e.getAttribute("name")));
            for (const i in groupedByKeys) {
                if (groupedByKeys.hasOwnProperty(i)) {
                    const group = groupedByKeys[i];
                    if (typeof (group) === "function") {
                        continue;
                    }
                    const key = group[0].name;
                    const values = group.map((item) => item.value).filter((v) => v);
                    if (this.ignoreFormDataInput(key, values)) {
                        continue;
                    }
                    // Skip numeric masks
                    if (numericInputs.indexOf(key) >= 0 && values[0]) {
                        values[0] = values[0].replace(",", "");
                    }
                    // Fix for MVC checkboxes:
                    if ($("input[name='" + key + "']", form).is(":checkbox") && values.length === 2 && values[1] === "false"
                        && (values[0] === "true" || values[0] === "false")) {
                        values.pop();
                    }
                    result.push({ name: key, value: values.join("|") });
                }
            }
            // Fix for multi-select:
            // If a multi-select control has no value, we should return empty value for it.
            // The default serializeArray() function just ignores it.
            $("select[multiple]", form).each((i, e) => {
                const key = $(e).attr("name");
                if (result.filter((v) => v.name === key).length === 0) {
                    result.push({ name: key, value: "" });
                }
            });
            return result;
        }
        ignoreFormDataInput(inputName, values) {
            return false;
        }
        cleanJson(str) {
            return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
        }
        getPostData(trigger) {
            let form = trigger.closest("[data-module]");
            if (!form.is("form")) {
                form = $("<form />").append(form.clone(true));
            }
            const data = this.getCleanFormData(form);
            // If it's master-details, then we need the index.
            const subFormContainer = trigger.closest(".subform-item");
            if (subFormContainer) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform")
                        .find(".subform-item").index(subFormContainer).toString(),
                });
            }
            data.push({ name: "current.request.url", value: this.currentRequestUrlProvider() });
            return data;
        }
        DefaultButtonKeyPress(event) {
            if (event.which === 13) {
                const target = $(event.currentTarget);
                let button = target.closest("[data-module]").find("[default-button]:first"); // Same module
                if (button.length === 0) {
                    button = $("[default-button]:first");
                } // anywhere
                button.click();
                return false;
            }
            else {
                return true;
            }
        }
        cleanUpNumberField(field) {
            const domElement = field.get(0);
            field.val(field.val().replace(/[^\d.-]/g, ""));
        }
        submitCleanGet(event) {
            const form = $(event.currentTarget);
            if (this.validate.validateForm(form) === false) {
                this.waiting.hide();
                return false;
            }
            const formData = this.getCleanFormData(form).filter((item) => item.name !== "__RequestVerificationToken");
            let url = this.url.removeEmptyQueries(form.attr("action"));
            try {
                form.find("input:checkbox:unchecked").each((ind, e) => url = this.url.removeQuery(url, $(e).attr("name")));
                for (const item of formData) {
                    let value = encodeURIComponent(item.value);
                    url = this.url.updateQuery(url, item.name, value);
                }
                url = this.url.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]")) {
                    const link = $(event.currentTarget);
                    if (link != undefined && link != null) {
                        let ajaxTarget = link.attr("ajax-target");
                        let ajaxhref = link.attr("href");
                        this.ajaxRedirect.go(url, form, false, false, true, undefined, ajaxTarget, ajaxhref);
                    }
                    else {
                        this.ajaxRedirect.go(url, form, false, false, true);
                    }
                }
                else {
                    location.href = url;
                }
            }
            catch (error) {
                console.error(error);
                alert(error);
            }
            return false;
        }
    }
    exports.default = Form;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0EsTUFBcUIsSUFBSTtRQUVyQixZQUNZLEdBQVEsRUFDUixRQUFrQixFQUNsQixPQUFnQixFQUNoQixZQUEwQjtZQUgxQixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUNsQixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ2hCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBRzVCLDhCQUF5QixHQUFtQixHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBRnZGLENBQUM7UUFJRSwyQkFBMkIsQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5Six3QkFBd0IsQ0FBQyxRQUFnQjtZQUM1QyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDO2lCQUM5QixFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRU0sb0JBQW9CLENBQUMsUUFBZ0I7WUFDeEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFTyxnQkFBZ0Is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