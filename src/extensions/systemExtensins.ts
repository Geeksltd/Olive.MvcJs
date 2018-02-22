import * as jq from 'olive/extensions/jQueryExtensions'

export default class SystemExtensins {

    static initialize() {
        window.download = this.download;
        Array.groupBy = this.groupBy;
        JSON.safeParse = this.safeParse;

        if (!String.prototype.endsWith) String.prototype.endsWith = this.stringEndsWith;
        if (!String.prototype.htmlEncode) String.prototype.htmlEncode = function () { return SystemExtensins.htmlEncode(this) };
        if (!String.prototype.htmlDecode) String.prototype.htmlDecode = function () { return SystemExtensins.htmlDecode(this) };

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

    static safeParse(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            throw error;
        }
    }

    static download(url) {
        $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
    }

    static groupBy(array: Array<any>, groupFunction: Function) {
        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(groupFunction(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });

        return Object.keys(groups).map((g) => groups[g]);
    }

    static stringEndsWith(searchString: string): boolean {
        var subjectString = this.toString();
        var position = subjectString.length - searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    }

    static htmlEncode(text: string): string {
        var a: any = document.createElement('a');
        a.appendChild(document.createTextNode(text));
        return a.innerHTML;
    }

    static htmlDecode(text: string): string {
        var a = document.createElement('a');
        a.innerHTML = text;
        return a.textContent;
    }
}