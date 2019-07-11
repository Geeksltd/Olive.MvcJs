define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var NumbericUpDown = /** @class */ (function () {
        function NumbericUpDown(targetInput) {
            this.input = targetInput;
        }
        NumbericUpDown.enable = function (selector) { selector.each(function (i, e) { return new NumbericUpDown($(e)).enable(); }); };
        NumbericUpDown.prototype.enable = function () {
            var min = this.input.attr("data-val-range-min");
            var max = this.input.attr("data-val-range-max");
            this.input.spinedit({
                minimum: parseFloat(min),
                maximum: parseFloat(max),
                step: 1,
            });
        };
        return NumbericUpDown;
    }());
    exports.default = NumbericUpDown;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtZXJpY1VwRG93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL251bWVyaWNVcERvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFDQTtRQUtJLHdCQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFKTSxxQkFBTSxHQUFiLFVBQWMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFqQyxDQUFpQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBTTlGLCtCQUFNLEdBQU47WUFDSSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2hELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFFaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7Z0JBQ2hCLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDO2dCQUN4QixPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDeEIsSUFBSSxFQUFFLENBQUM7YUFDVixDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0wscUJBQUM7SUFBRCxDQUFDLEFBbkJELElBbUJDIn0=