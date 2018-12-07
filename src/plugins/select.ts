export default class Select {
    //https://developer.snapappointments.com/bootstrap-select/

    public static enableEnhance(selector: JQuery) { selector.each((i, e) => this.enhance($(e))); }

    static enhance(selectControl: JQuery) {
        selectControl.selectpicker();
    }

    public static replaceSource(controlId: string, items) {

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
