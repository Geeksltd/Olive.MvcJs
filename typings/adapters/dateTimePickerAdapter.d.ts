/**
 * Maps legacy eonasdan datetimepicker options to Tempus Dominus 6.x (with legacy fallback).
 */
export default class DateTimePickerAdapter {
    static initialize(input: JQuery, options: any): void;
    private static tryTempusDominus;
    private static mapOptions;
    private static mapFormat;
    private static parseDate;
}
