define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimeControlFactory = void 0;
    var TimeControlFactory = /** @class */ (function () {
        function TimeControlFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        TimeControlFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new TimeControl($(e), _this.modalHelper); });
        };
        return TimeControlFactory;
    }());
    exports.TimeControlFactory = TimeControlFactory;
    var TimeControl = /** @class */ (function () {
        function TimeControl(targetInput, modalHelper) {
            var _this = this;
            this.modalHelper = modalHelper;
            var input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
            }
            input.attr("data-autofocus", "disabled");
            var options = {
                format: config_1.default.TIME_FORMAT,
                useCurrent: false,
                stepping: parseInt(input.attr("data-minute-steps") || config_1.default.MINUTE_INTERVALS.toString()),
                keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                locale: config_1.default.DATE_LOCALE,
                icons: {
                    up: "fas fa-chevron-up",
                    down: "fas fa-chevron-down"
                }
            };
            input.datetimepicker(options).data("DateTimePicker").keyBinds().clear = null;
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
        }
        return TimeControl;
    }());
    exports.default = TimeControl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZUNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy90aW1lQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQTtRQUNJLDRCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsbUNBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUFxRztZQUFuRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLEVBQXZDLENBQXVDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDekcseUJBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLGdEQUFrQjtJQUsvQjtRQUNJLHFCQUFZLFdBQWdCLEVBQVUsV0FBd0I7WUFBOUQsaUJBeUJDO1lBekJxQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUMxRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUM7WUFFeEIsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xCLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7Z0JBQ3pHLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7YUFDNUc7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRXpDLElBQU0sT0FBTyxHQUFHO2dCQUNaLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7Z0JBQzFCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxnQkFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUN6RixXQUFXLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDM0UsTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztnQkFDMUIsS0FBSyxFQUFFO29CQUNILEVBQUUsRUFBRSxtQkFBbUI7b0JBQ3ZCLElBQUksRUFBRSxxQkFBcUI7aUJBQzlCO2FBQ0osQ0FBQztZQUVGLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztZQUU3RSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7UUFDTCxrQkFBQztJQUFELENBQUMsQUEzQkQsSUEyQkMifQ==