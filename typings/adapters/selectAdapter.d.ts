/**
 * Select control adapter: bootstrap-select (BS5 beta) with Tom Select fallback.
 */
export default class SelectAdapter {
    static initialize(selectControl: JQuery, options?: any): void;
    private static tryBootstrapSelect;
    private static tryTomSelect;
    static refresh(selectControl: JQuery): void;
}
