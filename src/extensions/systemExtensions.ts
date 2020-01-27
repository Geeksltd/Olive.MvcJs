import * as jq from 'olive/extensions/jQueryExtensions'

export default class SystemExtensions {

    public static initialize() {
        window.download = this.download;
        Array.groupBy = this.groupBy;
        JSON.safeParse = this.safeParse;

        this.extendString();

        window.location.pathAndQuery = () => window.location.pathname + window.location.search;

        jq.enableValidateForCheckboxList();
        jq.enableValidateForTimePicker();

        $.fn.extend({
            screenOffset: jq.screenOffset,
            bindFirst: jq.bindFirst,
            //clone: jq.clone,
            raiseEvent: jq.raiseEvent,
            getUniqueSelector: jq.getUniqueSelector
        });
    }

    private static extend(type, name: string, implementation: Function) {
        var proto = type.prototype;

        if (implementation.length == 0) throw new Error("extend function needs at least one argument.");
        else if (implementation.length == 1) proto[name] = function () { return implementation(this) };
        else if (implementation.length == 2) proto[name] = function (arg) { return implementation(this, arg) };
        else if (implementation.length == 3) proto[name] = function (a1, a2) { return implementation(this, a1, a2) };
    }

    private static extendString() {

        this.extend(String, "endsWith",
            (instance: string, searchString: string) => {
                var position = instance.length - searchString.length;
                var lastIndex = instance.indexOf(searchString, position);
                return lastIndex !== -1 && lastIndex === position;
            });

        this.extend(String, "htmlEncode", instance => {
            var a: any = document.createElement('a');
            a.appendChild(document.createTextNode(instance));
            return a.innerHTML;
        });

        this.extend(String, "htmlDecode", instance => {
            var a = document.createElement('a');
            a.innerHTML = instance;
            return a.textContent;
        });

        this.extend(String, "startsWith", (instance: string, text: string) => instance.indexOf(text) === 0);

        this.extend(String, "withPrefix",
            (instance: string, prefix: string) => instance.startsWith(prefix) === false ? prefix + instance : instance);

        this.extend(String, "trimText", (instance, text: string) => instance.trimStart(text).trimEnd(text));

        this.extend(String, "trimStart",
            (instance, text: string) => instance.startsWith(text) ? instance.slice(text.length) : instance);

        this.extend(String, "trimEnd",
            (instance, text: string) => instance.endsWith(text) ? instance.slice(0, instance.lastIndexOf(text)) : instance);

        this.extend(String, "contains", (instance, text: string) => instance.indexOf(text) > -1);
    }

    private static safeParse(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            throw error;
        }
    }

    private static download(url) {
        $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
    }

    private static groupBy<T>(array: Array<T>, groupFunction: (item: T) => string | number): Dictionary<T> {
        var groups: Dictionary<T> = {};
        array.forEach((o) => {
            var group = JSON.stringify(groupFunction(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });

        return Object.keys(groups).map((g) => groups[g]) as any;
    }
}