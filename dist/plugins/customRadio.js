define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomRadio = /** @class */ (function () {
        function CustomRadio(targetInput) {
            this.checkedClassName = 'checked';
            this.input = targetInput;
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
                if (_this.input.data('change-action'))
                    _this.input.trigger('change.data-action');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tUmFkaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9jdXN0b21SYWRpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBWUkscUJBQVksV0FBZ0I7WUFWNUIscUJBQWdCLEdBQUcsU0FBUyxDQUFDO1lBV3pCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFUYSxrQkFBTSxHQUFwQixVQUFxQixRQUFnQjtZQUFyQyxpQkFLQztZQUpHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztnQkFDZixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3RDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQU1ELDRCQUFNLEdBQU47WUFBQSxpQkFhQztZQVpHLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBRTdDLElBQUksS0FBSyxHQUFHO2dCQUNSLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFFekMsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQ2pDLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFBO1lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBMUJNLDRCQUFnQixHQUFHLFNBQVMsQ0FBQztRQTJCeEMsa0JBQUM7S0FBQSxBQTlCRCxJQThCQztzQkE5Qm9CLFdBQVcifQ==