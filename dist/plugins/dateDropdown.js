define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateDropdown = /** @class */ (function () {
        function DateDropdown(targetInput) {
            this.input = targetInput;
        }
        DateDropdown.enable = function (selector) { selector.each(function (i, e) { return new DateDropdown($(e)).enable(); }); };
        DateDropdown.prototype.enable = function () {
            this.input.combodate({
                format: 'DD/MM/YYYY',
                template: 'DD / MMM / YYYY',
                minYear: 1985,
                maxYear: parseInt(moment().format('YYYY')),
                smartDays: true,
                firstItem: 'name'
            });
        };
        return DateDropdown;
    }());
    exports.default = DateDropdown;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZURyb3Bkb3duLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZGF0ZURyb3Bkb3duLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFLSSxzQkFBWSxXQUFlO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUMsV0FBVyxDQUFDO1FBQzNCLENBQUM7UUFKYSxtQkFBTSxHQUFwQixVQUFxQixRQUFlLElBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBQyxDQUFDLElBQUssT0FBQSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDLENBQUEsQ0FBQztRQU0vRiw2QkFBTSxHQUFOO1lBQ0ksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsU0FBUyxFQUFFLE1BQU07YUFDcEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLG1CQUFDO0lBQUQsQ0FBQyxBQW5CRCxJQW1CQyJ9