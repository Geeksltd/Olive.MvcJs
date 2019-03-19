import 'bootstrap-select'

export default class MultiSelect {
  //https://developer.snapappointments.com/bootstrap-select/
  private static options: any;

  public static enableEnhance(selector: JQuery) {
    if ($.fn.selectpicker)
      $.fn.selectpicker.Constructor.BootstrapVersion = "4";
    selector.each((i, e) => this.enhance($(e)));
  }

  public static setOptions(options: any): void {
    MultiSelect.options = $.extend({
      actionsBox: true,
      liveSearch: true,
      selectedTextFormat: "count"
    }, options)
  }

  static enhance(selectControl: JQuery) {
    selectControl.selectpicker(MultiSelect.options);
  }
}
