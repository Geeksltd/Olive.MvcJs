export default class DateDropdown {
    public static enable(selector: JQuery) { selector.each((i, e) => new DateDropdown($(e)).enable()); }

    constructor(private input: JQuery) { }

    private enable() {
        this.input.combodate({
            format: 'DD/MM/YYYY',
            template: 'DD / MMM / YYYY',
            minYear: 1985,
            maxYear: parseInt(moment().format('YYYY')),
            smartDays: true,
            firstItem: 'name'
        });
    }
}
