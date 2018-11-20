define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomRadio = /** @class */ (function () {
        function CustomRadio() {
        }
        CustomRadio.enable = function (customize, selector) {
            if (customize === void 0) { customize = null; }
            if (selector === void 0) { selector = 'input[type=radio]'; }
            var checkedClassName = 'checked';
            var sync = function () {
                $('input[type=radio].handled').each(function (index, elem) {
                    var radio = $(elem).next();
                    if ($(elem).is(':checked')) {
                        radio.addClass(checkedClassName);
                    }
                    else {
                        radio.removeClass(checkedClassName);
                    }
                });
            };
            $(selector + ':not(.handled)').each(function (index, elem) {
                var radio = $('<div class="radio-helper"/>');
                var input = $(elem);
                radio.attr('tabindex', (typeof input.attr('tabindex') === 'undefined') ? 0 : input.attr('tabindex'));
                var check = function () {
                    radio.addClass(checkedClassName);
                    $(elem).prop('checked', true).trigger('change');
                };
                radio.click(check);
                radio.keypress(function (event) {
                    if (event.keyCode === 32) {
                        check();
                        event.preventDefault();
                    }
                });
                $(elem).change(sync);
                $(elem).after(radio);
                $(elem).addClass('handled');
                if (customize)
                    customize(input, radio);
            });
            sync();
        };
        return CustomRadio;
    }());
    exports.default = CustomRadio;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tUmFkaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9jdXN0b21SYWRpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBQUE7UUE4Q0EsQ0FBQztRQTdDaUIsa0JBQU0sR0FBcEIsVUFBcUIsU0FBeUQsRUFBRSxRQUFzQztZQUFqRywwQkFBQSxFQUFBLGdCQUF5RDtZQUFFLHlCQUFBLEVBQUEsOEJBQXNDO1lBQ2xILElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO1lBRWpDLElBQUksSUFBSSxHQUFHO2dCQUNQLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxJQUFJO29CQUM1QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRTNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUN6QixLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7b0JBQ3JDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLENBQUM7d0JBQ0YsS0FBSyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO29CQUN4QyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDO1lBRUYsQ0FBQyxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxJQUFJO2dCQUM1QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVwQixLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBRXJHLElBQUksS0FBSyxHQUFHO29CQUNSLEtBQUssQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRCxDQUFDLENBQUE7Z0JBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFDLEtBQUs7b0JBQ2pCLEVBQUUsQ0FBQSxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQ3hCLENBQUM7d0JBQ0csS0FBSyxFQUFFLENBQUM7d0JBQ1IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUMzQixDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRTVCLEVBQUUsQ0FBQSxDQUFDLFNBQVMsQ0FBQztvQkFBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQUFDLEFBOUNELElBOENDIn0=