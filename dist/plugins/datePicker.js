define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, modal_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DatePicker = /** @class */ (function () {
        function DatePicker(targetInput) {
            this.input = targetInput;
        }
        DatePicker.enable = function (selector) { selector.each(function (i, e) { return new DatePicker($(e)).show(); }); };
        DatePicker.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.attr("data-control");
            var viewMode = this.input.attr("data-view-mode") || 'days';
            if (control == "date-picker") {
                this.input.datetimepicker({
                    format: config_1.default.DATE_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: { today: 'today' },
                    viewMode: viewMode,
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: config_1.default.DATE_LOCALE
                }).data("DateTimePicker").keyBinds().clear = null;
                // Now make calendar icon clickable as well             
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(function () { return _this.input.focus(); });
            }
            else
                alert("Don't know how to handle date control of " + control);
        };
        return DatePicker;
    }());
    exports.default = DatePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2RhdGVQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUtJLG9CQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFKYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQTNCLENBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFNaEcseUJBQUksR0FBSjtZQUFBLGlCQXlCQztZQXZCRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxlQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxlQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQzthQUN0RztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksTUFBTSxDQUFDO1lBRTNELElBQUksT0FBTyxJQUFJLGFBQWEsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLEtBQU0sQ0FBQyxjQUFjLENBQUM7b0JBQzdCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7b0JBQzFCLFVBQVUsRUFBRSxLQUFLO29CQUNqQixlQUFlLEVBQUUsSUFBSTtvQkFDckIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtvQkFDekIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDaEYsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztpQkFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xELHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7YUFDekc7O2dCQUNJLEtBQUssQ0FBQywyQ0FBMkMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBQ0wsaUJBQUM7SUFBRCxDQUFDLEFBbkNELElBbUNDIn0=