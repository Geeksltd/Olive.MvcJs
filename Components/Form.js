"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Form {
    static merge(items) {
        var result = [];
        var a = Array;
        var groupedByKeys = a.groupBy(items, i => i.name.toLowerCase());
        for (var i in groupedByKeys) {
            var group = groupedByKeys[i];
            if (typeof (group) == 'function')
                continue;
            var key = group[0].name;
            var values = group.map(item => item.value).filter((v) => v);
            // Fix for MVC checkboxes:
            if ($("input[name='" + key + "']").is(":checkbox") && values.length == 2 && values[1] == 'false'
                && (values[0] == 'true' || values[0] == 'false'))
                values.pop();
            result.push({ name: key, value: values.join("|") });
        }
        return result;
    }
    static cleanJson(str) {
        return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
    }
    ;
}
exports.Form = Form;
//# sourceMappingURL=Form.js.map