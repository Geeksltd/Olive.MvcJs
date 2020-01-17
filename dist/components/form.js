define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Form = /** @class */ (function () {
        function Form(url, validate, waiting, ajaxRedirect) {
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.currentRequestUrlProvider = function () { return window.location.pathAndQuery(); };
        }
        Form.prototype.enableDefaultButtonKeyPress = function (selector) {
            var _this = this;
            selector.off("keypress.default-button").on("keypress.default-button", function (e) { return _this.DefaultButtonKeyPress(e); });
        };
        Form.prototype.enablecleanUpNumberField = function (selector) {
            var _this = this;
            selector.off("blur.cleanup-number").on("blur.cleanup-number", function (e) { return _this.cleanUpNumberField($(e.currentTarget)); });
        };
        Form.prototype.enablesubmitCleanGet = function (selector) {
            var _this = this;
            selector.off("submit.clean-up").on("submit.clean-up", function (e) { return _this.submitCleanGet(e); });
        };
        Form.prototype.getCleanFormData = function (form) {
            var result = [];
            var disabledOnes = form.find(":disabled").removeAttr('disabled');
            var items = form.serializeArray();
            disabledOnes.attr('disabled', 'disabled');
            var groupedByKeys = Array.groupBy(items, function (i) { return i.name.toLowerCase(); });
            for (var i in groupedByKeys) {
                var group = groupedByKeys[i];
                if (typeof (group) == 'function')
                    continue;
                var key = group[0].name;
                var values = group.map(function (item) { return item.value; }).filter(function (v) { return v; });
                if (this.ignoreFormDataInput(key, values))
                    continue;
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
        Form.prototype.ignoreFormDataInput = function (inputName, values) {
            return false;
        };
        Form.prototype.cleanJson = function (str) {
            return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
        };
        ;
        Form.prototype.getPostData = function (trigger) {
            var form = trigger.closest("[data-module]");
            if (!form.is("form"))
                form = $("<form />").append(form.clone(true));
            var data = this.getCleanFormData(form);
            // If it's master-details, then we need the index.
            var subFormContainer = trigger.closest(".subform-item");
            if (subFormContainer) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
                });
            }
            data.push({ name: "current.request.url", value: this.currentRequestUrlProvider() });
            return data;
        };
        Form.prototype.DefaultButtonKeyPress = function (event) {
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
        Form.prototype.cleanUpNumberField = function (field) {
            var domElement = field.get(0);
            field.val(field.val().replace(/[^\d.-]/g, ""));
        };
        Form.prototype.submitCleanGet = function (event) {
            var _this = this;
            var form = $(event.currentTarget);
            if (this.validate.validateForm(form) == false) {
                this.waiting.hide();
                return false;
            }
            var formData = this.getCleanFormData(form).filter(function (item) { return item.name != "__RequestVerificationToken"; });
            var url = this.url.removeEmptyQueries(form.attr('action'));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = _this.url.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    url = this.url.updateQuery(url, item.name, item.value);
                }
                url = this.url.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]"))
                    this.ajaxRedirect.go(url, form, false, false, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFLQTtRQUVJLGNBQ1ksR0FBUSxFQUNSLFFBQWtCLEVBQ2xCLE9BQWdCLEVBQ2hCLFlBQTBCO1lBSDFCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xCLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDaEIsaUJBQVksR0FBWixZQUFZLENBQWM7WUFHNUIsOEJBQXlCLEdBQW1CLGNBQU0sT0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUE5QixDQUE4QixDQUFDO1FBRnZGLENBQUM7UUFJRSwwQ0FBMkIsR0FBbEMsVUFBbUMsUUFBZ0I7WUFBbkQsaUJBQXFLO1lBQTlHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFOUosdUNBQXdCLEdBQS9CLFVBQWdDLFFBQWdCO1lBQWhELGlCQUF3SztZQUFwSCxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBM0MsQ0FBMkMsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUVqSyxtQ0FBb0IsR0FBM0IsVUFBNEIsUUFBZ0I7WUFBNUMsaUJBQXVJO1lBQXZGLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBQyxDQUFDLElBQUssT0FBQSxL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