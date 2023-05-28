var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./dateTimePickerBase", "olive/config"], function (require, exports, dateTimePickerBase_1, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DateTimePickerFactory = void 0;
    var DateTimePickerFactory = /** @class */ (function () {
        function DateTimePickerFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        DateTimePickerFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new DateTimePicker($(e), _this.modalHelper).show(); });
        };
        return DateTimePickerFactory;
    }());
    exports.DateTimePickerFactory = DateTimePickerFactory;
    var DateTimePicker = /** @class */ (function (_super) {
        __extends(DateTimePicker, _super);
        function DateTimePicker(targetInput, modalHelper) {
            var _this = _super.call(this, targetInput, modalHelper) || this;
            _this.controlType = "date-picker|time-picker";
            _this.format = config_1.default.DATE_TIME_FORMAT;
            return _this;
        }
        DateTimePicker.prototype.modifyOptions = function (options) {
            $.extend(options, {
                sideBySide: true,
                showClear: true,
            });
        };
        return DateTimePicker;
    }(dateTimePickerBase_1.default));
    exports.default = DateTimePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFJQTtRQUNJLCtCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsc0NBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUErRztZQUE3RSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQWpELENBQWlELENBQUMsQ0FBQztRQUFDLENBQUM7UUFDbkgsNEJBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLHNEQUFxQjtJQU1sQztRQUE0QyxrQ0FBa0I7UUFJMUQsd0JBQVksV0FBbUIsRUFBRSxXQUF3QjtZQUF6RCxZQUNJLGtCQUFNLFdBQVcsRUFBRSxXQUFXLENBQUMsU0FDbEM7WUFMUyxpQkFBVyxHQUFHLHlCQUF5QixDQUFDO1lBQ3hDLFlBQU0sR0FBRyxnQkFBTSxDQUFDLGdCQUFnQixDQUFDOztRQUkzQyxDQUFDO1FBRVMsc0NBQWEsR0FBdkIsVUFBd0IsT0FBWTtZQUNoQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxVQUFVLEVBQUUsSUFBSTtnQkFDaEIsU0FBUyxFQUFFLElBQUk7YUFDbEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLHFCQUFDO0lBQUQsQ0FBQyxBQWRELENBQTRDLDRCQUFrQixHQWM3RCJ9