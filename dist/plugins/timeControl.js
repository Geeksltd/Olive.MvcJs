define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TimeControlFactory = /** @class */ (function () {
        function TimeControlFactory(modalHelper, delayedInitializer) {
            this.modalHelper = modalHelper;
            this.delayedInitializer = delayedInitializer;
        }
        TimeControlFactory.prototype.enable = function (selector) {
            var _this = this;
            this.delayedInitializer.initialize(selector, function (i, e) { return new TimeControl($(e), _this.modalHelper); });
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
            input.datetimepicker({
                format: config_1.default.TIME_FORMAT,
                useCurrent: false,
                stepping: parseInt(input.attr("data-minute-steps") || config_1.default.MINUTE_INTERVALS.toString()),
                keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                locale: config_1.default.DATE_LOCALE
            }).data("DateTimePicker").keyBinds().clear = null;
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
        }
        return TimeControl;
    }());
    exports.default = TimeControl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZUNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy90aW1lQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUtBO1FBQ0ksNEJBQW9CLFdBQXdCLEVBQ2hDLGtCQUFzQztZQUQ5QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUNoQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQUksQ0FBQztRQUVoRCxtQ0FBTSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBRUM7WUFERyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSSxDQUFDLFdBQVcsQ0FBQyxFQUF2QyxDQUF1QyxDQUFDLENBQUM7UUFDcEcsQ0FBQztRQUNMLHlCQUFDO0lBQUQsQ0FBQyxBQVBELElBT0M7SUFQWSxnREFBa0I7SUFRL0I7UUFDSSxxQkFBWSxXQUFnQixFQUFVLFdBQXdCO1lBQTlELGlCQWtCQztZQWxCcUMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDMUQsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBRXhCLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNsQixLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO2dCQUN6RyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO2FBQzVHO1lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6QyxLQUFLLENBQUMsY0FBYyxDQUFDO2dCQUNqQixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO2dCQUMxQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksZ0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDekYsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQzNFLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7YUFDN0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFFbEQsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQUFDLEFBcEJELElBb0JDIn0=