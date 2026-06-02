/**
 * Bootstrap 5 compatibility helpers for Olive.MvcJs.
 * Centralizes modal/tooltip usage so host apps can upgrade Bootstrap without scattered changes.
 */
export default class BootstrapAdapter {
    static showModal(element: JQuery): void;
    static hideModal(element: JQuery): void;
    static ensureTooltipCompatibility(): void;
    static getDateTimePickerWidgetSelector(): string;
}
