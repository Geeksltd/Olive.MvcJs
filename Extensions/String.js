if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString) {
        var subjectString = this.toString();
        var position = subjectString.length - searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
//# sourceMappingURL=String.js.map