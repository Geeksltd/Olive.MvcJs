define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Form = /** @class */ (function () {
        function Form() {
        }
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
            if (subFormContainer != null) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
                });
            }
            data.push({ name: "current.request.url", value: window.location.pathAndQuery() });
            return data;
        };
        Form.onDefaultButtonKeyPress = function (event) {
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
        return Form;
    }());
    exports.default = Form;
});
//# sourceMappingURL=Form.js.map