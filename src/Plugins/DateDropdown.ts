export default class DateDropdown {

    public static enable(input: any) {
        input.combodate({
            format: 'DD/MM/YYYY',
            template: 'DD / MMM / YYYY',
            minYear: 1985,
            maxYear: parseInt(moment().format('YYYY')),
            smartDays: true,
            firstItem: 'name'
        });
    }
}