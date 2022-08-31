var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBSUE7UUFDSSwrQkFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBRTFDLHNDQUFNLEdBQWIsVUFBYyxRQUFnQjtZQUE5QixpQkFBK0c7WUFBN0UsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFqRCxDQUFpRCxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ25ILDRCQUFDO0lBQUQsQ0FBQyxBQUpELElBSUM7SUFKWSxzREFBcUI7SUFNbEM7UUFBNEMsa0NBQWtCO1FBSTFELHdCQUFZLFdBQW1CLEVBQUUsV0FBd0I7WUFBekQsWUFDSSxrQkFBTSxXQUFXLEVBQUUsV0FBVyxDQUFDLFNBQ2xDO1lBTFMsaUJBQVcsR0FBRyx5QkFBeUIsQ0FBQztZQUN4QyxZQUFNLEdBQUcsZ0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQzs7UUFJM0MsQ0FBQztRQUVTLHNDQUFhLEdBQXZCLFVBQXdCLE9BQVk7WUFDaEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ2QsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDTCxxQkFBQztJQUFELENBQUMsQUFkRCxDQUE0Qyw0QkFBa0IsR0FjN0QifQ==