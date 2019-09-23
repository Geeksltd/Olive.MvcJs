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
define(["require", "exports", "olive/config", "./dateTimePickerBase"], function (require, exports, config_1, dateTimePickerBase_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DatePickerFactory = /** @class */ (function () {
        function DatePickerFactory(modalHelper, delayedInitializer) {
            this.modalHelper = modalHelper;
            this.delayedInitializer = delayedInitializer;
        }
        DatePickerFactory.prototype.enable = function (selector) {
            var _this = this;
            this.delayedInitializer.initialize(selector, function (i, e) { return new DatePicker($(e), _this.modalHelper).show(); });
        };
        return DatePickerFactory;
    }());
    exports.DatePickerFactory = DatePickerFactory;
    var DatePicker = /** @class */ (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(targetInput, modalHelper) {
            var _this = _super.call(this, targetInput, modalHelper) || this;
            _this.controlType = "date-picker";
            _this.format = config_1.default.DATE_FORMAT;
            return _this;
        }
        DatePicker.prototype.modifyOptions = function (options) {
            $.extend(options, {
                viewMode: this.input.attr("data-view-mode") || 'days'
            });
        };
        return DatePicker;
    }(dateTimePickerBase_1.default));
    exports.default = DatePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2RhdGVQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0lBS0E7UUFDSSwyQkFBb0IsV0FBd0IsRUFDaEMsa0JBQXNDO1lBRDlCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ2hDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFBSSxDQUFDO1FBRWhELGtDQUFNLEdBQWIsVUFBYyxRQUFnQjtZQUE5QixpQkFFQztZQURHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQTdDLENBQTZDLENBQUMsQ0FBQztRQUMxRyxDQUFDO1FBQ0wsd0JBQUM7SUFBRCxDQUFDLEFBUEQsSUFPQztJQVBZLDhDQUFpQjtJQVM5QjtRQUF3Qyw4QkFBa0I7UUFJdEQsb0JBQVksV0FBbUIsRUFBRSxXQUF3QjtZQUF6RCxZQUNJLGtCQUFNLFdBQVcsRUFBRSxXQUFXLENBQUMsU0FDbEM7WUFMUyxpQkFBVyxHQUFHLGFBQWEsQ0FBQztZQUM1QixZQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7O1FBSXRDLENBQUM7UUFFUyxrQ0FBYSxHQUF2QixVQUF3QixPQUFZO1lBQ2hDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLE1BQU07YUFDeEQsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FBQyxBQWJELENBQXdDLDRCQUFrQixHQWF6RCJ9