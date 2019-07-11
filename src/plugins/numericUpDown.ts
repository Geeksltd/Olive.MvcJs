
export default class NumbericUpDown {
    public static enable(selector: JQuery) { selector.each((i, e) => new NumbericUpDown($(e)).enable()) }

    constructor(private input: JQuery) { }

    private enable() {
        let min = this.input.attr("data-val-range-min");
        let max = this.input.attr("data-val-range-max");

        this.input.spinedit({
            minimum: parseFloat(min),
            maximum: parseFloat(max),
            step: 1,
        });
    }
}
