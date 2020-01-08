export default class CustomCheckbox {
    private static handledClassName = 'handled';

    public static enable(selector: JQuery) {
        selector.each((i, e) => {
            if (!$(e).hasClass(this.handledClassName))
                new CustomCheckbox($(e)).enable();
        });
    }

    constructor(private input: JQuery) { }

    private enable() {
        let checkBox = $('<div class="checkbox-helper"/>');

        let toggle = () => {
            if (this.input.attr('disabled')) return;

            this.input.prop('checked', !this.input.is(':checked')).focus();
            this.input.trigger('change');
        };

        checkBox.click(toggle);
        this.input.after(checkBox);
        this.input.addClass(CustomCheckbox.handledClassName);
    }
}
