import 'bootstrap-select'

export default class MultiSelect implements IService {
    //https://developer.snapappointments.com/bootstrap-select/

    /// TODO: this fields are obsolete and DI should use instead.
    private defaultOptions = {
        actionsBox: true,
        liveSearch: true,
        selectedTextFormat: "count"
    };
    private options: any = this.defaultOptions;

    public enableEnhance(selector: JQuery) {
        if ($.fn.selectpicker)
            $.fn.selectpicker.Constructor.BootstrapVersion = "4";
        selector.each((i, e) => this.enhance($(e)));
    }

    /// TODO: this method is obsolete and DI should use instead.
    public setOptions(options: any): void {
        console.warn('MultiSelect.setOptions is obsolete and will be removed in next version.');
        this.options = $.extend(this.defaultOptions, options)
    }

    protected enhance(selectControl: JQuery) {
        selectControl.selectpicker(this.options);
    }
}
