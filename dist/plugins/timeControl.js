define(["require", "exports", "olive/config", "olive/adapters/dateTimePickerAdapter"], function (require, exports, config_1, dateTimePickerAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimeControlFactory = void 0;
    class TimeControlFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new TimeControl($(e), this.modalHelper)); }
    }
    exports.TimeControlFactory = TimeControlFactory;
    class TimeControl {
        constructor(targetInput, modalHelper) {
            this.modalHelper = modalHelper;
            let input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
            }
            input.attr("data-autofocus", "disabled");
            const options = {
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
            dateTimePickerAdapter_1.default.initialize(input, options);
            const legacyPicker = input.data("DateTimePicker");
            if (legacyPicker === null || legacyPicker === void 0 ? void 0 : legacyPicker.keyBinds) {
                legacyPicker.keyBinds().clear = null;
            }
            input.parent().find(".fa-clock-o").parent(".input-group-addon").on('click', () => { input.focus(); });
        }
    }
    exports.default = TimeControl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZUNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy90aW1lQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBS0EsTUFBYSxrQkFBa0I7UUFDM0IsWUFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBRTFDLE1BQU0sQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hHO0lBSkQsZ0RBSUM7SUFDRCxNQUFxQixXQUFXO1FBQzVCLFlBQVksV0FBZ0IsRUFBVSxXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUMxRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUM7WUFFeEIsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztnQkFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RyxDQUFDO1lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUV6QyxNQUFNLE9BQU8sR0FBRztnQkFDWixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO2dCQUMxQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksZ0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDekYsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQzNFLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7Z0JBQzFCLEtBQUssRUFBRTtvQkFDSCxFQUFFLEVBQUUsbUJBQW1CO29CQUN2QixJQUFJLEVBQUUscUJBQXFCO2lCQUM5QjthQUNKLENBQUM7WUFFRiwrQkFBcUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNsRCxJQUFJLFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxRQUFRLEVBQUUsQ0FBQztnQkFDekIsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDekMsQ0FBQztZQUVELEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDO0tBQ0o7SUEvQkQsOEJBK0JDIn0=