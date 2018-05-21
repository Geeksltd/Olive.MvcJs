define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Paging = /** @class */ (function () {
        function Paging() {
        }
        Paging.enableOnSizeChanged = function (selector) {
            var _this = this;
            selector.off("change.pagination-size").on("change.pagination-size", function (e) { return _this.onSizeChanged(e); });
        };
        Paging.enableWithAjax = function (selector) {
            var _this = this;
            selector.off("click.ajax-paging").on("click.ajax-paging", function (e) { return _this.withAjax(e); });
        };
        Paging.onSizeChanged = function (event) {
            $(event.currentTarget).closest("form").submit();
        };
        Paging.withAjax = function (event) {
            var button = $(event.currentTarget);
            var page = button.attr("data-pagination");
            var key = "p";
            if (page.split('=').length > 1) {
                key = page.split('=')[0];
                page = page.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            input.val(page);
            if (input.val() != page) {
                // Drop down list case
                input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
                input.remove();
            }
        };
        return Paging;
    }());
    exports.default = Paging;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvcGFnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQThCQSxDQUFDO1FBNUJpQiwwQkFBbUIsR0FBakMsVUFBa0MsUUFBZ0I7WUFBbEQsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFFYSxxQkFBYyxHQUE1QixVQUE2QixRQUFnQjtZQUE3QyxpQkFHQztZQUZHLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQ3BELFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxvQkFBYSxHQUFwQixVQUFxQixLQUFZO1lBQzdCLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BELENBQUM7UUFFTSxlQUFRLEdBQWYsVUFBZ0IsS0FBd0I7WUFDcEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLENBQUM7WUFFeEYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsc0JBQXNCO2dCQUN0QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQixDQUFDO1FBQ0wsQ0FBQztRQUNMLGFBQUM7SUFBRCxDQUFDLEFBOUJELElBOEJDIn0=