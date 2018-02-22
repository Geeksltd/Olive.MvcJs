export default class DateDropdown {
     input: any;

    public static enable(selector:JQuery){selector.each((i,e) => new DateDropdown($(e)).enable());}
    
    constructor(targetInput:any){
        this.input=targetInput;
    }

    enable (){
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
