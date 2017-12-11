

import { WindowContext as windowContext } from "../components/windowContext"

export namespace Olive {
       export class TimeControl {
           input:any;
           
           constructor(targetInput:any) {
               this.input = targetInput;
           }

           show() {

               if (windowContext.isWindowModal()) {
                   this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", (e) => windowContext.adjustModalHeightForDataPicker(e));
                   this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", (e) => windowContext.adjustModalHeightForDataPicker(e));
               }

               this.input.attr("data-autofocus", "disabled");
               this.input.datetimepicker({
                   format: windowContext.setting.TIME_FORMAT,
                    useCurrent: false,
                    stepping: parseInt(this.input.attr("data-minute-steps") || windowContext.setting.MINUTE_INTERVALS.toString()),
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: windowContext.setting.DATE_LOCALE
               }).data("DateTimePicker").keyBinds().clear = null;

               var targetEventSelector = this.input.attr("data-control") == "time-picker" ? ".fa-clock-o" : ".fa-calendar";
               this.input.parent().find(targetEventSelector).parent(".input-group-addon").click(() => { this.input.focus(); });
           }
       }
}
