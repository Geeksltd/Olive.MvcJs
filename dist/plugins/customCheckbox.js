define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CustomCheckbox {
        static enable(selector) {
            selector.each((i, e) => {
                if (!$(e).hasClass(this.handledClassName))
                    new CustomCheckbox($(e)).enable();
            });
        }
        constructor(input) {
            this.input = input;
        }
        enable() {
            let checkBox = $('<div class="checkbox-helper"/>');
            let toggle = () => {
                if (this.input.attr('disabled'))
                    return;
                this.input.prop('checked', !this.input.is(':checked')).focus();
                this.input.trigger('change');
            };
            checkBox.click(toggle);
            this.input.after(checkBox);
            this.input.addClass(CustomCheckbox.handledClassName);
        }
    }
    CustomCheckbox.handledClassName = 'handled';
    exports.default = CustomCheckbox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ2hlY2tib3guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9jdXN0b21DaGVja2JveC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQSxNQUFxQixjQUFjO1FBR3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0I7WUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO29CQUNyQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxZQUFvQixLQUFhO1lBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFJLENBQUM7UUFFOUIsTUFBTTtZQUNWLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1lBRW5ELElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDZCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFBRSxPQUFPO2dCQUV4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUM7WUFFRixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3pELENBQUM7O0lBeEJjLCtCQUFnQixHQUFHLFNBQVMsQ0FBQztzQkFEM0IsY0FBYyJ9