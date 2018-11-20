export default class CustomRadio {
    input: any;
    checkedClassName = 'checked';
    static handledClassName = 'handled';

    public static enable(selector: JQuery) {
        selector.each((i, e) => {
            if (!$(e).hasClass(this.handledClassName))
                new CustomRadio($(e)).enable();
        });
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        let radio = $('<div class="radio-helper"/>');

        let check = () => {
            this.input.prop('checked', true).focus();

            if (this.input.data('change-action'))
                this.input.trigger('change.data-action');
        }

        radio.click(check);
        this.input.after(radio);
        this.input.addClass(CustomRadio.handledClassName);
    }
}
