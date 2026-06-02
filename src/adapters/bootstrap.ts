/**
 * Bootstrap 5 compatibility helpers for Olive.MvcJs.
 * Centralizes modal/tooltip usage so host apps can upgrade Bootstrap without scattered changes.
 */
export default class BootstrapAdapter {

    public static showModal(element: JQuery): void {
        if (window.bootstrap?.Modal) {
            const instance = window.bootstrap.Modal.getOrCreateInstance(element[0]);
            instance.show();
            return;
        }
        element.modal("show");
    }

    public static hideModal(element: JQuery): void {
        if (window.bootstrap?.Modal) {
            const instance = window.bootstrap.Modal.getInstance(element[0]);
            if (instance) {
                instance.hide();
                return;
            }
        }
        element.modal("hide");
    }

    public static ensureTooltipCompatibility(): void {
        const tooltipFn: any = $.fn.tooltip;
        if (tooltipFn && !tooltipFn.Constructor) {
            tooltipFn.Constructor = {};
        }
    }

    public static getDateTimePickerWidgetSelector(): string {
        return ".tempus-dominus-widget, .bootstrap-datetimepicker-widget";
    }
}
