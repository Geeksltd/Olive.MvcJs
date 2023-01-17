define(["require", "exports", "jquery-sortable", "jquery-ui-mouse", "jquery-ui-widget", "jquery-ui", "jquery-ui-touch-punch"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sorting = /** @class */ (function () {
        function Sorting(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        Sorting.prototype.enableDragSort = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.DragSort($(e)); });
        };
        Sorting.prototype.enablesetSortHeaderClass = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.setSortHeaderClass($(e)); });
        };
        Sorting.prototype.enableAjaxSorting = function (selector) {
            var _this = this;
            selector.off("click.ajax-sorting").on("click.ajax-sorting", function (e) { return _this.AjaxSorting(e); });
        };
        Sorting.prototype.AjaxSorting = function (event) {
            var button = $(event.currentTarget);
            var sort = button.attr("data-sort");
            var key = "s";
            if (sort.split("=").length > 1) {
                key = sort.split("=")[0];
                sort = sort.split("=")[1];
            }
            var input = $("[name='" + key + "']");
            if (input.val() === sort) {
                sort += ".DESC";
            }
            input.val(sort);
        };
        Sorting.prototype.setSortHeaderClass = function (thead) {
            var currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
            if (currentSort === "") {
                return;
            }
            var sortKey = currentSort.replace(".DESC", "").replace(".ASC", "");
            var currentThead = $("[data-sort='" + sortKey + "']");
            if (currentSort.contains(".DESC")) {
                currentThead.removeClass("sort-ascending");
                currentThead.addClass("sort-descending");
            }
            else {
                currentThead.removeClass("sort-descending");
                currentThead.addClass("sort-ascending");
            }
            currentThead.append("<i />");
        };
        Sorting.prototype.DragSort = function (container) {
            var _this = this;
            var itemsSelector = "> li";
            var config = {
                handle: "[data-sort-item]",
                containment: "parent",
                axis: "y",
                tolerance: "pointer",
                scroll: true,
                items: itemsSelector,
                helper: function (e, ui) {
                    // prevent TD collapse during drag
                    ui.children().each(function (i, c) { return $(c).width($(c).width()); });
                    return ui;
                },
                stop: function (e, ui) {
                    $(ui).children().removeAttr("style");
                    container.find(itemsSelector).children().removeAttr("style");
                    var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                    var handle = ui.item.find("[data-sort-item]");
                    var actionUrl = handle.attr("data-sort-action");
                    actionUrl = _this.url.addQuery(actionUrl, "drop-before", dropBefore);
                    actionUrl = _this.url.effectiveUrlProvider(actionUrl, handle);
                    _this.serverInvoker.invokeWithAjax({ currentTarget: handle.get(0) }, actionUrl);
                },
            };
            if (container.is("tbody")) {
                config.items = "> tr";
            }
            else if (container.is(".r-grid-body")) {
                config.items = "> .r-grid-row";
                delete config.axis;
            }
            container.sortable(config);
        };
        return Sorting;
    }());
    exports.default = Sorting;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3NvcnRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFTQTtRQUVJLGlCQUNZLEdBQVEsRUFDUixhQUE0QjtZQUQ1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Isa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBSSxDQUFDO1FBRXRDLGdDQUFjLEdBQXJCLFVBQXNCLFFBQWdCO1lBQXRDLGlCQUF5RjtZQUEvQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFbEYsMENBQXdCLEdBQS9CLFVBQWdDLFFBQWdCO1lBQWhELGlCQUE2RztZQUF6RCxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUV0RyxtQ0FBaUIsR0FBeEIsVUFBeUIsUUFBZ0I7WUFBekMsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO1FBQzVGLENBQUM7UUFFTyw2QkFBVyxHQUFuQixVQUFvQixLQUF3QjtZQUN4QyxJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7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