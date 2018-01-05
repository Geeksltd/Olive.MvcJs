define(["require", "exports", "olive/Extensions/JQueryExtensions"], function (require, exports, jq) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SystemExtensins = /** @class */ (function () {
        function SystemExtensins() {
        }
        SystemExtensins.initialize = function () {
            window.download = this.download;
            Array.groupBy = this.groupBy;
            JSON.safeParse = this.safeParse;
            if (!String.prototype.endsWith)
                String.prototype.endsWith = this.stringEndsWith;
            if (!String.prototype.htmlEncode)
                String.prototype.htmlEncode = function () { return SystemExtensins.htmlEncode(this); };
            if (!String.prototype.htmlDecode)
                String.prototype.htmlDecode = function () { return SystemExtensins.htmlDecode(this); };
            window.location.pathAndQuery = function () { return window.location.pathname + window.location.search; };
            jq.enableValidateForCheckboxList();
            jq.enableValidateForTimePicker();
            $.fn.extend({
                screenOffset: jq.screenOffset,
                bindFirst: jq.bindFirst,
                clone: jq.clone,
                raiseEvent: jq.raiseEvent,
                getUniqueSelector: jq.getUniqueSelector
            });
        };
        SystemExtensins.safeParse = function (data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                console.log('Cannot parse this data to Json: ');
                throw error;
            }
        };
        SystemExtensins.download = function (url) {
            $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
        };
        SystemExtensins.groupBy = function (array, groupFunction) {
            var groups = {};
            array.forEach(function (o) {
                var group = JSON.stringify(groupFunction(o));
                groups[group] = groups[group] || [];
                groups[group].push(o);
            });
            return Object.keys(groups).map(function (g) { return groups[g]; });
        };
        SystemExtensins.stringEndsWith = function (searchString) {
            var subjectString = this.toString();
            var position = subjectString.length - searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        };
        SystemExtensins.htmlEncode = function (text) {
            var a = document.createElement('a');
            a.appendChild(document.createTextNode(text));
            return a.innerHTML;
        };
        SystemExtensins.htmlDecode = function (text) {
            var a = document.createElement('a');
            a.innerHTML = text;
            return a.textContent;
        };
        return SystemExtensins;
    }());
    exports.default = SystemExtensins;
});
//# sourceMappingURL=SystemExtensins.js.map