export default class MultiSelect {
  //https://developer.snapappointments.com/bootstrap-select/

  public static enableEnhance(selector: JQuery) {
    $.fn.selectpicker.Constructor.BootstrapVersion = "4";
    selector.each((i, e) => this.enhance($(e)));
  }

  static enhance(selectControl: JQuery) {
      
    selectControl.selectpicker({
      actionsBox: true,
      liveSearch: true,
      selectedTextFormat: "count"
    });
  }
}
