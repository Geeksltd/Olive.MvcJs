var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
    var DateTimePickerFactory = /** @class */ (function () {
        function DateTimePickerFactory(modalHelper, delayedInitializer) {
            this.modalHelper = modalHelper;
            this.delayedInitializer = delayedInitializer;
        }
        DateTimePickerFactory.prototype.enable = function (selector) {
            var _this = this;
            this.delayedInitializer.initialize(selector, function (i, e) { return new DateTimePicker($(e), _this.modalHelper).show(); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7SUFLQTtRQUNJLCtCQUFvQixXQUF3QixFQUNoQyxrQkFBc0M7WUFEOUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDaEMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUFJLENBQUM7UUFFaEQsc0NBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUVDO1lBREcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBakQsQ0FBaUQsQ0FBQyxDQUFDO1FBQzlHLENBQUM7UUFDTCw0QkFBQztJQUFELENBQUMsQUFQRCxJQU9DO0lBUFksc0RBQXFCO0lBU2xDO1FBQTRDLGtDQUFrQjtRQUkxRCx3QkFBWSxXQUFtQixFQUFFLFdBQXdCO1lBQXpELFlBQ0ksa0JBQU0sV0FBVyxFQUFFLFdBQVcsQ0FBQyxTQUNsQztZQUxTLGlCQUFXLEdBQUcseUJBQXlCLENBQUM7WUFDeEMsWUFBTSxHQUFHLGdCQUFNLENBQUMsZ0JBQWdCLENBQUM7O1FBSTNDLENBQUM7UUFFUyxzQ0FBYSxHQUF2QixVQUF3QixPQUFZO1lBQ2hDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsSUFBSTthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0wscUJBQUM7SUFBRCxDQUFDLEFBZEQsQ0FBNEMsNEJBQWtCLEdBYzdEIn0=