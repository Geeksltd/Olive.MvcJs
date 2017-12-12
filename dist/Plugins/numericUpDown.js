exports.__esModule = true;
var NumbericUpDown = /** @class */ (function () {
    function NumbericUpDown(targetInput) {
        this.input = targetInput;
    }
    NumbericUpDown.prototype.enable = function () {
        var min = this.input.attr("data-val-range-min");
        var max = this.input.attr("data-val-range-max");
        this.input.spinedit({
            minimum: parseFloat(min),
            maximum: parseFloat(max),
            step: 1
        });
    };
    return NumbericUpDown;
}());
exports.NumbericUpDown = NumbericUpDown;
//# sourceMappingURL=numericUpDown.js.map