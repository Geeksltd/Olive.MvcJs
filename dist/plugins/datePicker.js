define(["require", "exports", "olive/config", "./dateTimePickerBase"], function (require, exports, config_1, dateTimePickerBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatePickerFactory = void 0;
    class DatePickerFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new DatePicker($(e), this.modalHelper).show()); }
    }
    exports.DatePickerFactory = DatePickerFactory;
    class DatePicker extends dateTimePickerBase_1.default {
        constructor(targetInput, modalHelper) {
            super(targetInput, modalHelper);
            this.controlType = "date-picker";
            this.format = config_1.default.DATE_FORMAT;
        }
        modifyOptions(options) {
            $.extend(options, {
                viewMode: this.input.attr("data-view-mode") || 'days',
            });
        }
    }
    exports.default = DatePicker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVBpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2RhdGVQaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUlBLE1BQWEsaUJBQWlCO1FBQzFCLFlBQW9CLFdBQXdCO1lBQXhCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQUksQ0FBQztRQUUxQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5RztJQUpELDhDQUlDO0lBRUQsTUFBcUIsVUFBVyxTQUFRLDRCQUFrQjtRQUl0RCxZQUFZLFdBQW1CLEVBQUUsV0FBd0I7WUFDckQsS0FBSyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUoxQixnQkFBVyxHQUFHLGFBQWEsQ0FBQztZQUM1QixXQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7UUFJdEMsQ0FBQztRQUVTLGFBQWEsQ0FBQyxPQUFZO1lBQ2hDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLE1BQU07YUFDeEQsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKO0lBYkQsNkJBYUMifQ==