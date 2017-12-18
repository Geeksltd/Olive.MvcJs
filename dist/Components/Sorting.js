define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sorting = /** @class */ (function () {
        function Sorting() {
        }
        Sorting.enableAjaxSorting = function (event) {
            var button = $(event.currentTarget);
            var sort = button.attr("data-sort");
            var key = "s";
            if (sort.split('=').length > 1) {
                key = sort.split('=')[0];
                sort = sort.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            if (input.val() == sort)
                sort += ".DESC";
            input.val(sort);
        };
        Sorting.setSortHeaderClass = function (thead) {
            var currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
            if (currentSort == "")
                return;
            var sortKey = thead.attr('data-sort');
            if (sortKey == currentSort && !thead.hasClass('sort-ascending')) {
                thead.addClass("sort-ascending");
                thead.append("<i />");
            }
            else if (currentSort == sortKey + ".DESC" && !thead.hasClass('sort-descending')) {
                thead.addClass("sort-descending");
                thead.append("<i />");
            }
        };
        return Sorting;
    }());
    exports.default = Sorting;
});
//# sourceMappingURL=Sorting.js.map