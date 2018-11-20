define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomCheckbox = /** @class */ (function () {
        function CustomCheckbox() {
        }
        CustomCheckbox.enable = function (customize, selector) {
            if (customize === void 0) { customize = null; }
            if (selector === void 0) { selector = "input[type=checkbox]"; }
            var checkedClassName = 'checked';
            $(selector + ':not(.handled)').each(function (index, elem) {
                var checkBox = $('<div class="checkbox-helper"/>');
                var input = $(elem);
                checkBox.attr('tabindex', (typeof input.attr('tabindex') === 'undefined') ? 0 : input.attr('tabindex'));
                var toggle = function () {
                    checkBox.toggleClass(checkedClassName);
                    input.prop('checked', checkBox.hasClass(checkedClassName));
                    if (input.data('change-action'))
                        input.trigger('change.data-action');
                };
                checkBox.keypress(function (event) {
                    if (event.keyCode === 32) {
                        toggle();
                        event.preventDefault();
                    }
                });
                checkBox.click(function () {
                    toggle();
                });
                var sync = function () {
                    if (input.is(':checked'))
                        checkBox.addClass(checkedClassName);
                    else
                        checkBox.removeClass(checkedClassName);
                };
                input.change(sync);
                input.after(checkBox);
                input.addClass('handled');
                if (customize)
                    customize(input, checkBox);
                sync();
            });
        };
        return CustomCheckbox;
    }());
    exports.default = CustomCheckbox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ2hlY2tib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9jdXN0b21DaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBQUE7UUE4Q0EsQ0FBQztRQTdDaUIscUJBQU0sR0FBcEIsVUFBcUIsU0FBeUQsRUFBRSxRQUF5QztZQUFwRywwQkFBQSxFQUFBLGdCQUF5RDtZQUFFLHlCQUFBLEVBQUEsaUNBQXlDO1lBQ3JILElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1lBRWpDLENBQUMsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsSUFBSTtnQkFDNUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7Z0JBQ25ELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUV4RyxJQUFJLE1BQU0sR0FBRztvQkFDVCxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO29CQUUzRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUNoQyxLQUFLLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQztnQkFFRixRQUFRLENBQUMsUUFBUSxDQUFDLFVBQUMsS0FBSztvQkFDcEIsRUFBRSxDQUFBLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxFQUFFLENBQUMsQ0FDeEIsQ0FBQzt3QkFDRyxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzNCLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLEtBQUssQ0FBQztvQkFDWCxNQUFNLEVBQUUsQ0FBQztnQkFDYixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLElBQUksR0FBRztvQkFDUCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNyQixRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3hDLElBQUk7d0JBQ0EsUUFBUSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUM7Z0JBRUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFMUIsRUFBRSxDQUFBLENBQUMsU0FBUyxDQUFDO29CQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBRXpDLElBQUksRUFBRSxDQUFDO1lBQ1gsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0wscUJBQUM7SUFBRCxDQUFDLEFBOUNELElBOENDIn0=