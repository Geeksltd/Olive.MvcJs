define(["require", "exports", "olive/components/modal", "olive/config"], function (require, exports, modal_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimePicker = /** @class */ (function () {
        function DateTimePicker(targetInput) {
            this.input = targetInput;
        }
        DateTimePicker.enable = function (selector) { selector.each(function (i, e) { return new DateTimePicker($(e)).show(); }); };
        DateTimePicker.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return modal_1.default.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.attr("data-control");
            var viewMode = this.input.attr("data-view-mode") || 'days';
            if (control == "date-picker|time-picker") {
                this.input.datetimepicker({
                    format: config_1.default.DATE_TIME_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: { today: 'Date' },
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
        return DateTimePicker;
    }());
    exports.default = DateTimePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQU1BO1FBS0ksd0JBQVksV0FBZ0I7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUphLHFCQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQU1wRyw2QkFBSSxHQUFKO1lBQUEsaUJBeUJDO1lBdkJHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7Z0JBQ25HLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7WUFDdkcsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzlDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksTUFBTSxDQUFDO1lBRTNELEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxLQUFNLENBQUMsY0FBYyxDQUFDO29CQUM3QixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxnQkFBZ0I7b0JBQy9CLFVBQVUsRUFBRSxLQUFLO29CQUNqQixlQUFlLEVBQUUsSUFBSTtvQkFDckIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtvQkFDeEIsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDaEYsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztpQkFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7Z0JBQ2xELHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7WUFDMUcsQ0FBQztZQUNELElBQUk7Z0JBQUMsS0FBSyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFDTCxxQkFBQztJQUFELENBQUMsQUFuQ0QsSUFtQ0MifQ==