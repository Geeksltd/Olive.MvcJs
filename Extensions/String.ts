// -------------------- String Extensions ------------------
interface String { endsWith(searchString: string): boolean; }
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString) {
        var subjectString = this.toString();
        var position = subjectString.length - searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}