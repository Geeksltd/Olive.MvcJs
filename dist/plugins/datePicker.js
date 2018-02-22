define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, Modal_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DatePicker = /** @class */ (function () {
        function DatePicker(targetInput) {
            this.input = targetInput;
        }
        DatePicker.enable = function (selector) { selector.each(function (i, e) { return new DatePicker($(e)).show(); }); };
        DatePicker.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return Modal_1.default.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return Modal_1.default.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.attr("data-control");
            var viewMode = this.input.attr("data-view-mode") || 'days';
            if (control == "date-picker") {
                this.input.datetimepicker({
                    format: Config_1.default.DATE_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: { today: 'today' },
                    viewMode: viewMode,
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: Config_1.default.DATE_LOCALE
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGF0ZVBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QbHVnaW5zL0RhdGVQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUtJLG9CQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFKYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQTNCLENBQTJCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFNaEcseUJBQUksR0FBSjtZQUFBLGlCQXlCQztZQXZCRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO2dCQUNuRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1lBQ3ZHLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM5QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLE1BQU0sQ0FBQztZQUUzRCxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLEtBQU0sQ0FBQyxjQUFjLENBQUM7b0JBQzdCLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7b0JBQzFCLFVBQVUsRUFBRSxLQUFLO29CQUNqQixlQUFlLEVBQUUsSUFBSTtvQkFDckIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRTtvQkFDekIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDaEYsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztpQkFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xELHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7WUFDMUcsQ0FBQztZQUNELElBQUk7Z0JBQUMsS0FBSyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFDTCxpQkFBQztJQUFELENBQUMsQUFuQ0QsSUFtQ0MifQ==