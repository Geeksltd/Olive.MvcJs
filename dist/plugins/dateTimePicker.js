define(["require", "exports", "./dateTimePickerBase", "olive/config"], function (require, exports, dateTimePickerBase_1, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DateTimePickerFactory = void 0;
    class DateTimePickerFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new DateTimePicker($(e), this.modalHelper).show()); }
    }
    exports.DateTimePickerFactory = DateTimePickerFactory;
    class DateTimePicker extends dateTimePickerBase_1.default {
        constructor(targetInput, modalHelper) {
            super(targetInput, modalHelper);
            this.controlType = "date-picker|time-picker";
            this.format = config_1.default.DATE_TIME_FORMAT;
        }
        modifyOptions(options) {
            $.extend(options, {
                sideBySide: true,
                showClear: true,
            });
        }
    }
    exports.default = DateTimePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBSUEsTUFBYSxxQkFBcUI7UUFDOUIsWUFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBRTFDLE1BQU0sQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xIO0lBSkQsc0RBSUM7SUFFRCxNQUFxQixjQUFlLFNBQVEsNEJBQWtCO1FBSTFELFlBQVksV0FBbUIsRUFBRSxXQUF3QjtZQUNyRCxLQUFLLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBSjFCLGdCQUFXLEdBQUcseUJBQXlCLENBQUM7WUFDeEMsV0FBTSxHQUFHLGdCQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFJM0MsQ0FBQztRQUVTLGFBQWEsQ0FBQyxPQUFZO1lBQ2hDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsSUFBSTthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0o7SUFkRCxpQ0FjQyJ9