define(["require", "exports", "olive/extensions/jqueryExtensions"], function (require, exports, jq) {
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
                //clone: jq.clone,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3lzdGVtRXh0ZW5zaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0V4dGVuc2lvbnMvU3lzdGVtRXh0ZW5zaW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFBQTtRQW9FQSxDQUFDO1FBbEVVLDBCQUFVLEdBQWpCO1lBQ0ksTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2hDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFFaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztnQkFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2hGLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7Z0JBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsY0FBYyxNQUFNLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztZQUN4SCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLGNBQWMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7WUFFeEgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsY0FBTSxPQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFqRCxDQUFpRCxDQUFDO1lBRXZGLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1lBQ25DLEVBQUUs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