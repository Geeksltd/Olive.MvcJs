
///<reference path="../require.config.ts"/>

import helper = require("/Component/WindowContext");

export namespace Olive {
   export class TimeControl{
       input:any;
       
       constructor(targetInput:any){
           this.input=targetInput;
       }
       
        if (helper.getInstance().isWindowModal()) {
            input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", (e) => this.adjustModalHeightForDataPicker(e));
            input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", (e) => this.adjustModalHeightForDataPicker(e));
        }
        input.attr("data-autofocus", "disabled");
        input.datetimepicker({
            format: this.TIME_FORMAT,
            useCurrent: false,
            stepping: parseInt(input.attr("data-minute-steps") || this.MINUTE_INTERVALS.toString()),
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: this.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;
        input.parent().find(".fa-clock-o").parent(".input-group-addon").click(() => { input.focus(); });
   }
}
