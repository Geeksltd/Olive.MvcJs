
export default class NumbericUpDown {
    input: any;
    constructor(targetInput: any) {
        this.input = targetInput;          
    }

    public enable() {
        var min = this.input.attr("data-val-range-min");
        var max = this.input.attr("data-val-range-max");
        this.input.spinedit({
            minimum: parseFloat(min),
            maximum: parseFloat(max),
            step: 1,
        });
    }
}
