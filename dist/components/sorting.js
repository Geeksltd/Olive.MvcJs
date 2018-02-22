define(["require", "exports", "olive/components/url", "olive/mvc/formAction"], function (require, exports, Url_1, FormAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sorting = /** @class */ (function () {
        function Sorting() {
        }
        Sorting.enableDragSort = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.DragSort($(e)); });
        };
        ;
        Sorting.enablesetSortHeaderClass = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.setSortHeaderClass($(e)); });
        };
        ;
        Sorting.enableAjaxSorting = function (selector) {
            var _this = this;
            selector.off("click.ajax-sorting").on("click.ajax-sorting", function (e) { return _this.AjaxSorting(e); });
        };
        ;
        Sorting.AjaxSorting = function (event) {
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
        Sorting.DragSort = function (container) {
            var isTable = container.is("tbody");
            var items = isTable ? "> tr" : "> li"; // TODO: Do we need to support any other markup?
            container.sortable({
                handle: '[data-sort-item]',
                items: items,
                containment: "parent",
                axis: 'y',
                helper: function (e, ui) {
                    // prevent TD collapse during drag
                    ui.children().each(function (i, c) { return $(c).width($(c).width()); });
                    return ui;
                },
                stop: function (e, ui) {
                    var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                    var handle = ui.item.find("[data-sort-item]");
                    var actionUrl = handle.attr("data-sort-action");
                    actionUrl = Url_1.default.addQuery(actionUrl, "drop-before", dropBefore);
                    FormAction_1.default.invokeWithAjax(null /*{ currentTarget: handle.get(0) }*/, actionUrl);
                }
            });
        };
        return Sorting;
    }());
    exports.default = Sorting;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29ydGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Db21wb25lbnRzL1NvcnRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUFBO1FBb0VBLENBQUM7UUFsRWlCLHNCQUFjLEdBQTVCLFVBQTZCLFFBQWdCO1lBQTdDLGlCQUErRjtZQUE5QyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQTtRQUFDLENBQUM7UUFBQSxDQUFDO1FBRWxGLGdDQUF3QixHQUF0QyxVQUF1QyxRQUFnQjtZQUF2RCxpQkFBbUg7WUFBeEQsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQTtRQUFDLENBQUM7UUFBQSxDQUFDO1FBRXRHLHlCQUFpQixHQUEvQixVQUFnQyxRQUFnQjtZQUFoRCxpQkFFQztZQURHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUE7UUFDekYsQ0FBQztRQUFBLENBQUM7UUFFSyxtQkFBVyxHQUFsQixVQUFtQixLQUF3QjtZQUN2QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDO2dCQUFDLElBQUksSUFBSSxPQUFPLENBQUM7WUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixDQUFDO1FBRU0sMEJBQWtCLEdBQXpCLFVBQTBCLEtBQWE7WUFDbkMsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ25GLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7Z0JBQUMsTUFBTSxDQUFDO1lBRTlCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlELEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDakMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixDQUFDO1lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxPQUFPLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNsQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFCLENBQUM7UUFDTCxDQUFDO1FBRU0sZ0JBQVEsR0FBZixVQUFnQixTQUFTO1lBRXJCLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGdEQUFnRDtZQUV2RixTQUFTLENBQUMsUUFBUSxDQUFDO2dCQUNmLE1BQU0sRUFBRSxrQkFBa0I7Z0JBQzFCLEtBQUssRUFBRSxLQUFLO2dCQUNaLFdBQVcsRUFBRSxRQUFRO2dCQUNyQixJQUFJLEVBQUUsR0FBRztnQkFDVCxNQUFNLEVBQUUsVUFBQyxDQUFDLEVBQUUsRUFBRTtvQkFDVixrQ0FBa0M7b0JBQ2xDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQyxDQUFDO29CQUN2RCxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsSUFBSSxFQUFFLFVBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBRVIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXRGLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBRTlDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDaEQsU0FBUyxHQUFHLGFBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFFL0Qsb0JBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFBLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUNuRixDQUFDO2FBQ0osQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGNBQUM7SUFBRCxDQUFDLEFBcEVELElBb0VDIn0=