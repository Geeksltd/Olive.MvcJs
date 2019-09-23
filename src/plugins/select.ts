import 'bootstrap-select'
import { DelayedInitializer } from './delayedInitializer';

export default class Select implements IService {
    //https://developer.snapappointments.com/bootstrap-select/

    public enableEnhance(selector: JQuery, delayedInitializer: DelayedInitializer) {
        delayedInitializer.initialize(selector, (i, e) => this.enhance($(e)));
    }

    private enhance(selectControl: JQuery) {
        selectControl.selectpicker();
    }

    public replaceSource(controlId: string, items) {

        let $control = $('#' + controlId);

        if ($control.is("select")) {
            $control.empty();
            for (let i = 0; i < items.length; i++) {
                $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
            }

        } else {
            console.log("Unable to replace list items");
        }
    }
}
