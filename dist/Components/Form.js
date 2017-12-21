define(["require", "exports", "olive/Components/Url", "olive/Components/Validate", "olive/Components/Waiting", "olive/Mvc/AjaxRedirect"], function (require, exports, Url_1, Validate_1, Waiting_1, AjaxRedirect_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Form = /** @class */ (function () {
        function Form() {
        }
        Form.enableDefaultButtonKeyPress = function (selector) {
            var _this = this;
            selector.off("keypress.default-button").on("keypress.default-button", function (e) { return _this.DefaultButtonKeyPress(e); });
        };
        Form.enablecleanUpNumberField = function (selector) {
            var _this = this;
            selector.off("blur.cleanup-number").on("blur.cleanup-number", function (e) { return _this.cleanUpNumberField($(e.currentTarget)); });
        };
        Form.enablesubmitCleanGet = function (selector) {
            var _this = this;
            selector.off("submit.clean-up").on("submit.clean-up", function (e) { return _this.submitCleanGet(e); });
        };
        Form.merge = function (items) {
            var result = [];
            var groupedByKeys = Array.groupBy(items, function (i) { return i.name.toLowerCase(); });
            for (var i in groupedByKeys) {
                var group = groupedByKeys[i];
                if (typeof (group) == 'function')
                    continue;
                var key = group[0].name;
                var values = group.map(function (item) { return item.value; }).filter(function (v) { return v; });
                // Fix for MVC checkboxes:
                if ($("input[name='" + key + "']").is(":checkbox") && values.length == 2 && values[1] == 'false'
                    && (values[0] == 'true' || values[0] == 'false'))
                    values.pop();
                result.push({ name: key, value: values.join("|") });
            }
            return result;
        };
        Form.cleanJson = function (str) {
            return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
        };
        ;
        Form.getPostData = function (trigger) {
            var form = trigger.closest("[data-module]");
            if (!form.is("form"))
                form = $("<form />").append(form.clone(true));
            var data = Form.merge(form.serializeArray());
            // If it's master-details, then we need the index.
            var subFormContainer = trigger.closest(".subform-item");
            if (subFormContainer) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
                });
            }
            data.push({ name: "current.request.url", value: window.location.pathAndQuery() });
            return data;
        };
        Form.DefaultButtonKeyPress = function (event) {
            if (event.which === 13) {
                var target = $(event.currentTarget);
                var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
                if (button.length == 0)
                    button = $('[default-button]:first'); // anywhere
                button.click();
                return false;
            }
            else
                return true;
        };
        Form.cleanUpNumberField = function (field) {
            var domElement = field.get(0);
            field.val(field.val().replace(/[^\d.-]/g, ""));
        };
        Form.submitCleanGet = function (event) {
            var form = $(event.currentTarget);
            if (Validate_1.default.validateForm(form) == false) {
                Waiting_1.default.hide();
                return false;
            }
            var formData = Form.merge(form.serializeArray()).filter(function (item) { return item.name != "__RequestVerificationToken"; });
            var url = Url_1.default.removeEmptyQueries(form.attr('action'));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = Url_1.default.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    url = Url_1.default.updateQuery(url, item.name, item.value);
                }
                url = Url_1.default.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]"))
                    AjaxRedirect_1.default.go(url, form, false, false, true);
                else
                    location.href = url;
            }
            catch (error) {
                console.log(error);
                alert(error);
            }
            return false;
        };
        return Form;
    }());
    exports.default = Form;
});
//# sourceMappingURL=Form.js.map