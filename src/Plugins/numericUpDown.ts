
export default class NumbericUpDown {
    input: any;
    
     public static enable(selector:JQuery){selector.each((i,e)=> new NumbericUpDown($(e)).enable())}
    
    constructor(targetInput: any) {
        this.input = targetInput;          
    }

    public enable() {
        let min = this.input.attr("data-val-range-min");
        let max = this.input.attr("data-val-range-max");

        this.input.spinedit({
            minimum: parseFloat(min),
            maximum: parseFloat(max),
            step: 1,
        });
    }
}
