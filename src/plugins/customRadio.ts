export default class CustomRadio {
    public static enable(customize: (input: JQuery, helper: JQuery) => void = null, selector: string = 'input[type=radio]') { 
        let checkedClassName = 'checked';

        let sync = () => {
            $('input[type=radio].handled').each((index, elem) => {
                let radio = $(elem).next();

                if ($(elem).is(':checked')) {
                    radio.addClass(checkedClassName);
                }
                else {
                    radio.removeClass(checkedClassName);
                }
            });
        };

        $(selector + ':not(.handled)').each((index, elem) => {
            let radio = $('<div class="radio-helper"/>');
            let input = $(elem);

            radio.attr('tabindex', (typeof input.attr('tabindex') === 'undefined') ? 0 : input.attr('tabindex'));
                        
            let check = () => {
                radio.addClass(checkedClassName);
                $(elem).prop('checked', true).trigger('change');
            }

            radio.click(check);
            radio.keypress((event) => {
                if(event.keyCode === 32)
                {
                    check();
                    event.preventDefault();
                }
            });

            $(elem).change(sync);
            $(elem).after(radio);
            $(elem).addClass('handled');

            if(customize) customize(input, radio);
        });

        sync();
    }
}
