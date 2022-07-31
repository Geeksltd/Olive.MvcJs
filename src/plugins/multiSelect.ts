import 'bootstrap-select'
import { ModalHelper } from "olive/components/modal"
import Config from "olive/config"

export class MultiSelectFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new MultiSelect($(e), this.modalHelper).show()); }
}

export default class MultiSelect implements IService {
    //https://developer.snapappointments.com/bootstrap-select/


    constructor(protected selectControl: JQuery, private modalHelper: ModalHelper) {
        if ($.fn.selectpicker)
            $.fn.selectpicker.Constructor.BootstrapVersion = "4";
    }

    public show() {

        var maxoptions = this.selectControl.attr("max-limit") || false;

        const options = {
            actionsBox: true,
            liveSearch: true,
            selectedTextFormat: "count",
            maxOptions: maxoptions
        };
        this.selectControl.selectpicker(options);
    }
}
