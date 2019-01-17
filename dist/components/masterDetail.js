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
            $("input[name$=MustBeDeleted][value]").closest('[data-subform]').hide();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFzdGVyRGV0YWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvbWFzdGVyRGV0YWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtRQStCQSxDQUFDO1FBOUJpQixtQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUFyQyxpQkFBeUk7WUFBaEcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFbEksZ0NBQW1CLEdBQTFCO1lBQ0ksSUFBSSxVQUFVLEdBQUcsVUFBQSxPQUFPLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxFQUF4RCxDQUF3RCxDQUFDO1lBQ3JGLHFCQUFxQjtZQUNyQixDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEUscUJBQXFCO1lBQ3JCLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztZQUFsRSxDQUFrRSxDQUFDLENBQUM7WUFDeEUsbUJBQW1CO1lBQ25CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25GLENBQUMsQ0FBQyxDQUFDO1lBQ0gsc0JBQXNCO1lBQ3RCLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO2dCQUM5QixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVNLDBCQUFhLEdBQXBCLFVBQXFCLEtBQXdCO1lBQ3pDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFcEMsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzNCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0wsbUJBQUM7SUFBRCxDQUFDLEFBL0JELElBK0JDIn0=