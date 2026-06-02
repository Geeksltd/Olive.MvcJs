/**
 * Select control adapter: bootstrap-select (BS5 beta) with Tom Select fallback.
 */
export default class SelectAdapter {

    public static initialize(selectControl: JQuery, options?: any): void {
        if (this.tryBootstrapSelect(selectControl, options)) {
            return;
        }
        this.tryTomSelect(selectControl, options);
    }

    private static tryBootstrapSelect(selectControl: JQuery, options?: any): boolean {
        if (!$.fn.selectpicker) {
            return false;
        }
        if ($.fn.selectpicker.Constructor) {
            $.fn.selectpicker.Constructor.BootstrapVersion = "5";
        }
        selectControl.selectpicker(options || {});
        return true;
    }

    private static tryTomSelect(selectControl: JQuery, options?: any): boolean {
        const TomSelectGlobal: any = (window as any).TomSelect;
        if (!TomSelectGlobal) {
            selectControl.selectpicker?.(options || {});
            return false;
        }

        const element = selectControl[0] as HTMLSelectElement;
        if (!element || selectControl.data("tomselect")) {
            return true;
        }

        const instance = new TomSelectGlobal(element, options || {});
        selectControl.data("tomselect", instance);
        return true;
    }

    public static refresh(selectControl: JQuery): void {
        if (selectControl.data("tomselect")) {
            selectControl.data("tomselect").sync();
            return;
        }
        selectControl.selectpicker?.("refresh");
    }
}
