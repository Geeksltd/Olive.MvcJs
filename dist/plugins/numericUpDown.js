define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NumbericUpDown {
        static enable(selector) { selector.each((i, e) => new NumbericUpDown($(e)).enable()); }
        constructor(input) {
            this.input = input;
        }
        enable() {
            let min = this.input.attr("data-val-range-min");
            let max = this.input.attr("data-val-range-max");
            this.input.spinedit({
                minimum: parseFloat(min),
                maximum: parseFloat(max),
                step: 1,
            });
        }
    }
    exports.default = NumbericUpDown;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtZXJpY1VwRG93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL251bWVyaWNVcERvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQ0EsTUFBcUIsY0FBYztRQUN4QixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBRXJHLFlBQW9CLEtBQWE7WUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQUksQ0FBQztRQUU5QixNQUFNO1lBQ1YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNoRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO2dCQUNoQixPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDeEIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3hCLElBQUksRUFBRSxDQUFDO2FBQ1YsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKO0lBZkQsaUNBZUMifQ==