export default class CustomCheckbox {
    public static enable(customize: (input: JQuery, helper: JQuery) => void = null, selector: string = "input[type=checkbox]") { 
        let checkedClassName = 'checked';

        $(selector + ':not(.handled)').each((index, elem) => {            
            let checkBox = $('<div class="checkbox-helper"/>');
            let input = $(elem);

            checkBox.attr('tabindex', (typeof input.attr('tabindex') === 'undefined') ? 0 : input.attr('tabindex'));

            let toggle = () => {
                checkBox.toggleClass(checkedClassName);
                input.prop('checked', checkBox.hasClass(checkedClassName));

                if (input.data('change-action'))
                input.trigger('change.data-action');
            };

            checkBox.keypress((event) => {
                if(event.keyCode === 32)
                {
                    toggle();
                    event.preventDefault();
                }
            });

            checkBox.click(() => {
                toggle();
            });

            let sync = () => {
                if (input.is(':checked'))
                    checkBox.addClass(checkedClassName);
                else
                    checkBox.removeClass(checkedClassName);
            };

            input.change(sync);
            input.after(checkBox);
            input.addClass('handled');

            if(customize) customize(input, checkBox);
                        
            sync();
        });
    }
}
