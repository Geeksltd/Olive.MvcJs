if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString) {
        var subjectString = this.toString();
        var position = subjectString.length - searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
if (!String.prototype.htmlEncode) {
    String.prototype.htmlEncode = function () {
        var a = document.createElement('a');
        a.appendChild(document.createTextNode(this));
        return a.innerHTML;
    };
}
if (!String.prototype.htmlDecode) {
    String.prototype.htmlDecode = function () {
        var a = document.createElement('a');
        a.innerHTML = this;
        return a.textContent;
    };
}
//# sourceMappingURL=String.js.map