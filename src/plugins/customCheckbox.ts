export default class CustomCheckbox {
    input: any;
    checkedClassName = 'checked';
    static handledClassName = 'handled';

    public static enable(selector: JQuery) {
        selector.each((i, e) => {
            if (!$(e).hasClass(this.handledClassName))
                new CustomCheckbox($(e)).enable();
        });
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        let checkBox = $('<div class="checkbox-helper"/>');

        let toggle = () => {
            this.input.prop('checked', !this.input.is(':checked')).focus();

            if (this.input.data('change-action'))
                this.input.trigger('change.data-action');
        };

        checkBox.click(toggle);
        this.input.after(checkBox);
        this.input.addClass(CustomCheckbox.handledClassName);
    }
}
