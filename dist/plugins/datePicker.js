var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "olive/config", "./dateTimePickerBase"], function (require, exports, config_1, dateTimePickerBase_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DatePicker = /** @class */ (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(targetInput) {
            var _this = _super.call(this, targetInput) || this;
            _this.controlType = "date-picker";
            _this.format = config_1.default.DATE_FORMAT;
            return _this;
        }
        DatePicker.enable = function (selector) { selector.each(function (i, e) { return new DatePicker($(e)).show(); }); };
        DatePicker.prototype.modifyOptions = function (options) {
            $.extend(options, {
                viewMode: this.input.attr("data-view-mode") || 'days'
            });
        };
        return DatePicker;
    }(dateTimePickerBase_1.default));
    exports.default = DatePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2RhdGVQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBR0E7UUFBd0MsOEJBQWtCO1FBTXRELG9CQUFZLFdBQW1CO1lBQS9CLFlBQ0ksa0JBQU0sV0FBVyxDQUFDLFNBQ3JCO1lBUEQsaUJBQVcsR0FBRyxhQUFhLENBQUM7WUFDNUIsWUFBTSxHQUFHLGdCQUFNLENBQUMsV0FBVyxDQUFDOztRQU01QixDQUFDO1FBSmEsaUJBQU0sR0FBcEIsVUFBcUIsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUEzQixDQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBTWhHLGtDQUFhLEdBQWIsVUFBYyxPQUFZO1lBQ3RCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLE1BQU07YUFDeEQsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FBQyxBQWZELENBQXdDLDRCQUFrQixHQWV6RCJ9