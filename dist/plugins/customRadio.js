define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomRadio = /** @class */ (function () {
        function CustomRadio(input) {
            this.input = input;
        }
        CustomRadio.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) {
                if (!$(e).hasClass(_this.handledClassName))
                    new CustomRadio($(e)).enable();
            });
        };
        CustomRadio.prototype.enable = function () {
            var _this = this;
            var radio = $('<div class="radio-helper"/>');
            var check = function () {
                _this.input.prop('checked', true).focus();
                _this.input.trigger('change');
            };
            radio.click(check);
            this.input.after(radio);
            this.input.addClass(CustomRadio.handledClassName);
        };
        CustomRadio.handledClassName = 'handled';
        return CustomRadio;
    }());
    exports.default = CustomRadio;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tUmFkaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9jdXN0b21SYWRpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBVUkscUJBQW9CLEtBQWE7WUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQUksQ0FBQztRQVB4QixrQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUFyQyxpQkFLQztZQUpHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDZixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3JDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUlPLDRCQUFNLEdBQWQ7WUFBQSxpQkFXQztZQVZHLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBRTdDLElBQUksS0FBSyxHQUFHO2dCQUNSLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekMsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFBO1lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBdEJjLDRCQUFnQixHQUFHLFNBQVMsQ0FBQztRQXVCaEQsa0JBQUM7S0FBQSxBQXhCRCxJQXdCQztzQkF4Qm9CLFdBQVcifQ==