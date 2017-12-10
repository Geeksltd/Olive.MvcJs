(function () {
    var a: any = Array;
    a.groupBy = (array: Array<any>, groupFunction: Function) => {

        var groups = {};
        array.forEach(function (o) {
            var group = JSON.stringify(groupFunction(o));
            groups[group] = groups[group] || [];
            groups[group].push(o);
        });

        return Object.keys(groups).map((g) => groups[g]);
    };
})();