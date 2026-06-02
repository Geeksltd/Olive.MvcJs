define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Maps legacy eonasdan datetimepicker options to Tempus Dominus 6.x (with legacy fallback).
     */
    class DateTimePickerAdapter {
        static initialize(input, options) {
            if (this.tryTempusDominus(input, options)) {
                return;
            }
            input.datetimepicker(options);
        }
        static tryTempusDominus(input, options) {
            const tempusDominusGlobal = window.tempusDominus;
            if (!(tempusDominusGlobal === null || tempusDominusGlobal === void 0 ? void 0 : tempusDominusGlobal.TempusDominus)) {
                return false;
            }
            const element = input[0];
            if (!element) {
                return false;
            }
            const tdOptions = this.mapOptions(options);
            const picker = new tempusDominusGlobal.TempusDominus(element, tdOptions);
            input.data("td-picker", picker);
            return true;
        }
        static mapOptions(options) {
            var _a, _b, _c, _d, _e;
            const display = {
                components: {
                    decades: true,
                    year: true,
                    month: true,
                    date: true,
                    hours: (_b = (_a = options.format) === null || _a === void 0 ? void 0 : _a.includes("HH")) !== null && _b !== void 0 ? _b : false,
                    minutes: (_d = (_c = options.format) === null || _c === void 0 ? void 0 : _c.includes("mm")) !== null && _d !== void 0 ? _d : false,
                    seconds: false,
                },
                icons: options.icons,
            };
            const restrictions = {};
            if (options.minDate) {
                restrictions.minDate = this.parseDate(options.minDate);
            }
            if (options.maxDate) {
                restrictions.maxDate = this.parseDate(options.maxDate);
            }
            return {
                display,
                localization: {
                    locale: options.locale || "en-gb",
                    format: this.mapFormat(options.format),
                    hourCycle: "h23",
                },
                stepping: options.stepping || 1,
                restrictions,
                useCurrent: (_e = options.useCurrent) !== null && _e !== void 0 ? _e : false,
            };
        }
        static mapFormat(format) {
            if (!format) {
                return "dd/MM/yyyy";
            }
            return format
                .replace(/YYYY/g, "yyyy")
                .replace(/DD/g, "dd")
                .replace(/HH/g, "HH")
                .replace(/mm/g, "mm");
        }
        static parseDate(value) {
            if (value instanceof Date) {
                return value;
            }
            if (typeof moment !== "undefined") {
                return moment(value, ["DD/MM/YYYY", "MM/DD/YYYY"]).toDate();
            }
            return new Date(value);
        }
    }
    exports.default = DateTimePickerAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXJBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkYXB0ZXJzL2RhdGVUaW1lUGlja2VyQWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTs7T0FFRztJQUNILE1BQXFCLHFCQUFxQjtRQUUvQixNQUFNLENBQUMsVUFBVSxDQUFDLEtBQWEsRUFBRSxPQUFZO1lBQ2hELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN4QyxPQUFPO1lBQ1gsQ0FBQztZQUNELEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVPLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFhLEVBQUUsT0FBWTtZQUN2RCxNQUFNLG1CQUFtQixHQUFTLE1BQWMsQ0FBQyxhQUFhLENBQUM7WUFDL0QsSUFBSSxDQUFDLENBQUEsbUJBQW1CLGFBQW5CLG1CQUFtQix1QkFBbkIsbUJBQW1CLENBQUUsYUFBYSxDQUFBLEVBQUUsQ0FBQztnQkFDdEMsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pFLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQVk7O1lBQ2xDLE1BQU0sT0FBTyxHQUFRO2dCQUNqQixVQUFVLEVBQUU7b0JBQ1IsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsS0FBSyxFQUFFLElBQUk7b0JBQ1gsSUFBSSxFQUFFLElBQUk7b0JBQ1YsS0FBSyxFQUFFLE1BQUEsTUFBQSxPQUFPLENBQUMsTUFBTSwwQ0FBRSxRQUFRLENBQUMsSUFBSSxDQUFDLG1DQUFJLEtBQUs7b0JBQzlDLE9BQU8sRUFBRSxNQUFBLE1BQUEsT0FBTyxDQUFDLE1BQU0sMENBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxtQ0FBSSxLQUFLO29CQUNoRCxPQUFPLEVBQUUsS0FBSztpQkFDakI7Z0JBQ0QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLO2FBQ3ZCLENBQUM7WUFFRixNQUFNLFlBQVksR0FBUSxFQUFFLENBQUM7WUFDN0IsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2xCLFlBQVksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsQ0FBQztZQUNELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNsQixZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNELENBQUM7WUFFRCxPQUFPO2dCQUNILE9BQU87Z0JBQ1AsWUFBWSxFQUFFO29CQUNWLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU87b0JBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ3RDLFNBQVMsRUFBRSxLQUFLO2lCQUNuQjtnQkFDRCxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDO2dCQUMvQixZQUFZO2dCQUNaLFVBQVUsRUFBRSxNQUFBLE9BQU8sQ0FBQyxVQUFVLG1DQUFJLEtBQUs7YUFDMUMsQ0FBQztRQUNOLENBQUM7UUFFTyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQWM7WUFDbkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNWLE9BQU8sWUFBWSxDQUFDO1lBQ3hCLENBQUM7WUFDRCxPQUFPLE1BQU07aUJBQ1IsT0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7aUJBQ3hCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO2lCQUNwQixPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztpQkFDcEIsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBRU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFVO1lBQy9CLElBQUksS0FBSyxZQUFZLElBQUksRUFBRSxDQUFDO2dCQUN4QixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUUsQ0FBQztnQkFDaEMsT0FBUSxNQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDekUsQ0FBQztZQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQztLQUNKO0lBakZELHdDQWlGQyJ9