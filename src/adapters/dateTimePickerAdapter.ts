/**
 * Maps legacy eonasdan datetimepicker options to Tempus Dominus 6.x (with legacy fallback).
 */
export default class DateTimePickerAdapter {

    public static initialize(input: JQuery, options: any): void {
        if (this.tryTempusDominus(input, options)) {
            return;
        }
        input.datetimepicker(options);
    }

    private static tryTempusDominus(input: JQuery, options: any): boolean {
        const tempusDominusGlobal: any = (window as any).tempusDominus;
        if (!tempusDominusGlobal?.TempusDominus) {
            return false;
        }

        const element = input[0];
        if (!element) {
            return false;
        }

        const tdOptions = this.mapOptions(options);
        const picker = new tempusDominusGlobal.TempusDominus(element, tdOptions);
        input.data("td-picker", picker);
        return true;
    }

    private static mapOptions(options: any): any {
        const display: any = {
            components: {
                decades: true,
                year: true,
                month: true,
                date: true,
                hours: options.format?.includes("HH") ?? false,
                minutes: options.format?.includes("mm") ?? false,
                seconds: false,
            },
            icons: options.icons,
        };

        const restrictions: any = {};
        if (options.minDate) {
            restrictions.minDate = this.parseDate(options.minDate);
        }
        if (options.maxDate) {
            restrictions.maxDate = this.parseDate(options.maxDate);
        }

        return {
            display,
            localization: {
                locale: options.locale || "en-gb",
                format: this.mapFormat(options.format),
                hourCycle: "h23",
            },
            stepping: options.stepping || 1,
            restrictions,
            useCurrent: options.useCurrent ?? false,
        };
    }

    private static mapFormat(format: string): string {
        if (!format) {
            return "dd/MM/yyyy";
        }
        return format
            .replace(/YYYY/g, "yyyy")
            .replace(/DD/g, "dd")
            .replace(/HH/g, "HH")
            .replace(/mm/g, "mm");
    }

    private static parseDate(value: any): Date {
        if (value instanceof Date) {
            return value;
        }
        if (typeof moment !== "undefined") {
            return (moment as any)(value, ["DD/MM/YYYY", "MM/DD/YYYY"]).toDate();
        }
        return new Date(value);
    }
}
