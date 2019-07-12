define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // import FormAction from 'olive/mvc/formAction'
    var Paging = /** @class */ (function () {
        function Paging(url, formAction) {
            this.url = url;
            this.formAction = formAction;
        }
        Paging.prototype.enableOnSizeChanged = function (selector) {
            var _this = this;
            selector.off("change.pagination-size").on("change.pagination-size", function (e) { return _this.onSizeChanged(e); });
        };
        Paging.prototype.enableWithAjax = function (selector) {
            var _this = this;
            selector.off("click.ajax-paging").on("click.ajax-paging", function (e) { return _this.withAjax(e); });
        };
        Paging.prototype.onSizeChanged = function (event) {
            var form = $(event.currentTarget).closest("form");
            if (form.length === 0)
                return;
            if (form.attr("method") == "get")
                form.submit();
            else {
                var actionUrl = this.url.effectiveUrlProvider(form.attr("action"), $(event.currentTarget));
                this.formAction.invokeWithAjax_fa(event, actionUrl);
            }
        };
        Paging.prototype.withAjax = function (event) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvcGFnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUEsZ0RBQWdEO0lBRWhEO1FBRUksZ0JBQW9CLEdBQVEsRUFDaEIsVUFBNkI7WUFEckIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNoQixlQUFVLEdBQVYsVUFBVSxDQUFtQjtRQUFJLENBQUM7UUFFdkMsb0NBQW1CLEdBQTFCLFVBQTJCLFFBQWdCO1lBQTNDLGlCQUVDO1lBREcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBRU0sK0JBQWMsR0FBckIsVUFBc0IsUUFBZ0I7WUFBdEMsaUJBR0M7WUFGRyxRQUFRLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUNwRCxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU8sOEJBQWEsR0FBckIsVUFBc0IsS0FBWTtZQUM5QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBQzlCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLO2dCQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDM0M7Z0JBQ0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7YUFDdkQ7UUFDTCxDQUFDO1FBRU8seUJBQVEsR0FBaEIsVUFBaUIsS0FBd0I7WUFDckMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwQyxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDMUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFBRTtZQUV4RixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN0QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hCLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksRUFBRTtnQkFDckIsc0JBQXNCO2dCQUN0QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUNsQjtRQUNMLENBQUM7UUFDTCxhQUFDO0lBQUQsQ0FBQyxBQXZDRCxJQXVDQyJ9