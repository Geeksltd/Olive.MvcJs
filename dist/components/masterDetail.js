define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MasterDetail = /** @class */ (function () {
        function MasterDetail() {
        }
        MasterDetail.enable = function (selector) {
            var _this = this;
            selector.off("click.delete-subform").on("click.delete-subform", function (e) { return _this.deleteSubForm(e); });
        };
        MasterDetail.updateSubFormStates = function () {
            var countItems = function (element) { return $(element).parent().find(".subform-item:visible").length; };
            // Hide removed items
            $("input[name$=MustBeDeleted][value]").val("true");
            $("input[name$=MustBeDeleted][value]").closest('.subform-item').hide();
            // hide empty headers
            $(".horizontal-subform thead").each(function (i, e) {
                return $(e).css('visibility', (countItems(e) > 0) ? 'visible' : 'hidden');
            });
            // Hide add buttons
            $("[data-subform-max]").each(function (i, e) {
                var show = countItems(e) < parseInt($(e).attr('data-subform-max'));
                $(e).find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
            });
            // Hide delete buttons
            $("[data-subform-min]").each(function (i, e) {
                var show = countItems(e) > parseInt($(e).attr('data-subform-min'));
                $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css('visibility', (show) ? 'visible' : 'hidden');
            });
        };
        MasterDetail.deleteSubForm = function (event) {
            var button = $(event.currentTarget);
            var container = button.parents(".subform-item");
            container.find("input[name$=MustBeDeleted]").val("true");
            this.updateSubFormStates();
            event.preventDefault();
        };
        return MasterDetail;
    }());
    exports.default = MasterDetail;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzdGVyRGV0YWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvbWFzdGVyRGV0YWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQStCQSxDQUFDO1FBOUJpQixtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUFyQyxpQkFBeUk7WUFBaEcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFbEksZ0NBQW1CLEdBQTFCO1lBQ0ksSUFBSSxVQUFVLEdBQUcsVUFBQSxPQUFPLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxFQUF4RCxDQUF3RCxDQUFDO1lBQ3JGLHFCQUFxQjtZQUNyQixDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3ZFLHFCQUFxQjtZQUNyQixDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsT0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFBbEUsQ0FBa0UsQ0FBQyxDQUFDO1lBQ3hFLG1CQUFtQjtZQUNuQixDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRixDQUFDLENBQUMsQ0FBQztZQUNILHNCQUFzQjtZQUN0QixDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSwwQkFBYSxHQUFwQixVQUFxQixLQUF3QjtZQUN6QyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXBDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDaEQsU0FBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMzQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0FBQyxBQS9CRCxJQStCQyJ9