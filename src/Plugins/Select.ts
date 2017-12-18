export default class Select {

    public static enhance(selectControl: JQuery) {
        selectControl.chosen({ disable_search_threshold: 5 });
    }

    public static replaceSource(controlId: string, items) {

        var $control = $('#' + controlId);

        if ($control.is("select")) {
            $control.empty();
            for (var i = 0; i < items.length; i++) {
                $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
            }

        } else {
            console.log("Unable to replace list items");
        }
    }
}