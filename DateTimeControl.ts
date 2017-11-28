
namespace Olive{
  
  export class DateTimeControl{
   targetControl : any;
   
   constructor(input:any) {
       this.targetControl = input;
   }
   
   if (this.isWindowModal()) {
            targetControl.off("dp.show.adjustHeight").on("dp.show.adjustHeight", (e) => this.adjustModalHeightForDataPicker(e));
            targetControl.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", (e) => this.adjustModalHeightForDataPicker(e));
    }
    targetControl.attr("data-autofocus", "disabled");
    targetControl.datetimepicker({
            format: this.DATE_TIME_FORMAT,
            useCurrent: false,
            showTodayButton: true,
            icons: { today: 'today' },
            stepping: parseInt(input.attr("data-minute-steps") || this.MINUTE_INTERVALS.toString()),
            keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
            locale: this.DATE_LOCALE
        }).data("DateTimePicker").keyBinds().clear = null;
        targetControl.parent().find(".fa-calendar").click(function () { input.focus(); });
 }

}
