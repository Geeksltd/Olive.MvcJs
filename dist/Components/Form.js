Object.defineProperty(exports, "__esModule", { value: true });
var Form = /** @class */ (function () {
    function Form() {
    }
    Form.merge = function (items) {
        var result = [];
        var a = Array;
        var groupedByKeys = a.groupBy(items, function (i) { return i.name.toLowerCase(); });
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
    return Form;
}());
exports.default = Form;
//# sourceMappingURL=Form.js.map