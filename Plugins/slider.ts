

import { WindowContext as windowContext } from "../components/windowContext"

export namespace Olive {
       export class Slider {
           input:any;
           options; 
           constructor(targetInput:any) {
               this.input = targetInput;
               this.options = { min: 0, max: 100, value: null, range: false, formatter: null, tooltip: 'always', upper: null, tooltip_split: false };
           }

           enable() {

               var data_options = this.input.attr("data-options") ? JSON.parse(windowContext.cleanJson(this.input.attr("data-options"))) : null;
               if (data_options) $.extend(true, this.options, data_options);

               this.options.range = this.input.attr("data-control") == "range-slider";
               if (this.options.range) {
                   if (this.options.tooltip_split == false)
                       this.options.formatter = v => v[0] + " - " + v[1];

                   if (this.input.attr("id").endsWith("Max")) return;
                   var maxInput = $('[name="' + this.input.attr("id").split('.')[0] + "." + this.options.upper + '\"]');
                   if (maxInput.length == 0)
                       maxInput = $('[name="' + this.options.upper || this.input.attr("id") + 'Max' + '\"]');

                   if (maxInput.length == 0) throw new Error("Upper input was not found for the range slider.");
                   this.options.value = [Number(this.input.val() || this.options.min), Number(maxInput.val() || this.options.max)];

                   // Standard SEARCH min and max.														 
                   // TODO: Change the following to first detect if we're in a search control context and skip the following otherwise.
                   var container = $(this.input).closest(".group-control");
                   if (container.length == 0) container = this.input.parent();
                   container.children().each((i, e) => $(e).hide());
                   var rangeSlider = $("<input type='text' class='range-slider'/>").attr("id", this.input.attr("id") + "_slider").appendTo(container);
                   (<any>rangeSlider).slider(this.options).on('change', ev => { this.input.val(ev.value.newValue[0]); maxInput.val(ev.value.newValue[1]); });   ///// Updated ***********
               }
               else {
                   this.options.value = Number(this.input.val() || this.options.min);
                   (<any>this.input).slider(this.options).on('change', ev => { this.input.val(ev.value.newValue); });  ///// Updated ***********
               }
           }
       }
}



