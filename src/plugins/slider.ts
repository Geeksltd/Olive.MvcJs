
import Form from "olive/components/form"

export class SliderFactory implements IService {
    constructor(private form: Form) { }

    public enable(selector: JQuery) { selector.each((i, e) => new Slider($(e), this.form).enable()); }
}

export default class Slider {
    input: JQuery;
    options;

    constructor(targetInput: JQuery, private form: Form) {
        this.input = targetInput;
        this.options = { min: 0, max: 100, value: null, range: false, formatter: null, tooltip: 'always', upper: null, tooltip_split: false };
    }

    enable() {

        let data_options = this.input.attr("data-options") ? JSON.parse(this.form.cleanJson(this.input.attr("data-options"))) : null;
        if (data_options) $.extend(true, this.options, data_options);

        this.options.range = this.input.attr("data-control") == "range-slider";
        if (this.options.range) {
            if (this.options.tooltip_split == false)
                this.options.formatter = v => v[0] + " - " + v[1];

            if (this.input.attr("id").endsWith("Max")) return;
            let maxInput = $('[name="' + this.input.attr("id").split('.')[0] + "." + this.options.upper + '\"]');
            if (maxInput.length == 0)
                maxInput = $('[name="' + (this.options.upper || (this.input.attr("id") + 'Max')) + '\"]');

            if (maxInput.length == 0) throw new Error("Upper input was not found for the range slider.");
            this.options.value = [Number(this.input.val() || this.options.min), Number(maxInput.val() || this.options.max)];

            // Standard SEARCH min and max.														 
            // TODO: Change the following to first detect if we're in a search control context and skip the following otherwise.
            let container = $(this.input).closest(".group-control");
            if (container.length == 0) container = this.input.parent();
            container.children().each((i, e) => $(e).hide());
            let rangeSlider = $("<input type='text' class='range-slider'/>").attr("id", this.input.attr("id") + "_slider").appendTo(container);
            (<any>rangeSlider).slider(this.options).on('change', ev => { this.input.val(ev.value.newValue[0]); maxInput.val(ev.value.newValue[1]); });   ///// Updated ***********
        }
        else {
            this.options.value = Number(this.input.val() || this.options.min);
            (<any>this.input).slider(this.options).on('change', ev => { this.input.val(ev.value.newValue); });  ///// Updated ***********
        }
    }
}



