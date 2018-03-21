define(["require", "exports", "olive/components/url", "olive/components/validate", "olive/components/waiting", "olive/mvc/ajaxRedirect"], function (require, exports, url_1, validate_1, waiting_1, ajaxRedirect_1) {
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
        Form.getCleanFormData = function (form) {
            var result = [];
            var items = form.serializeArray();
            var groupedByKeys = Array.groupBy(items, function (i) { return i.name.toLowerCase(); });
            for (var i in groupedByKeys) {
                var group = groupedByKeys[i];
                if (typeof (group) == 'function')
                    continue;
                var key = group[0].name;
                var values = group.map(function (item) { return item.value; }).filter(function (v) { return v; });
                // Fix for MVC checkboxes:
                if ($("input[name='" + key + "']", form).is(":checkbox") && values.length == 2 && values[1] == 'false'
                    && (values[0] == 'true' || values[0] == 'false'))
                    values.pop();
                result.push({ name: key, value: values.join("|") });
            }
            // Fix for multi-select:
            // If a multi-select control has no value, we should return empty value for it.
            // The default serializeArray() function just ignores it.
            $("select[multiple]", form).each(function (i, e) {
                var key = $(e).attr("name");
                if (result.filter(function (v) { return v.name === key; }).length === 0)
                    result.push({ name: key, value: "" });
            });
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
            var data = Form.getCleanFormData(form);
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
            if (validate_1.default.validateForm(form) == false) {
                waiting_1.default.hide();
                return false;
            }
            var formData = Form.getCleanFormData(form).filter(function (item) { return item.name != "__RequestVerificationToken"; });
            var url = url_1.default.removeEmptyQueries(form.attr('action'));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = url_1.default.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    url = url_1.default.updateQuery(url, item.name, item.value);
                }
                url = url_1.default.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]"))
                    ajaxRedirect_1.default.go(url, form, false, false, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFLQTtRQUFBO1FBc0dBLENBQUM7UUFwR2lCLGdDQUEyQixHQUF6QyxVQUEwQyxRQUFnQjtZQUExRCxpQkFBNEs7WUFBOUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUU5Siw2QkFBd0IsR0FBdEMsVUFBdUMsUUFBZ0I7WUFBdkQsaUJBQStLO1lBQXBILFFBQVEsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBRWpLLHlCQUFvQixHQUFsQyxVQUFtQyxRQUFnQjtZQUFuRCxpQkFBOEk7WUFBdkYsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFdkkscUJBQWdCLEdBQXZCLFVBQXdCLElBQVk7WUFDaEMsSUFBSSxNQUFNLEdBQWtDLEVBQUUsQ0FBQztZQUUvQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFbEMsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFB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