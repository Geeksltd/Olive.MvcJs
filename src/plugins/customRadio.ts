export default class CustomRadio {
    private static handledClassName = 'handled';

    public static enable(selector: JQuery) {
        selector.each((i, e) => {
            if (!$(e).hasClass(this.handledClassName))
                new CustomRadio($(e)).enable();
        });
    }

    constructor(private input: JQuery) { }

    private enable() {
        let radio = $('<div class="radio-helper"/>');

        let check = () => {
            if (this.input.attr('disabled')) return;

            this.input.prop('checked', true).focus();
            this.input.trigger('change');
        }

        radio.click(check);
        this.input.after(radio);
        this.input.addClass(CustomRadio.handledClassName);
    }
}
