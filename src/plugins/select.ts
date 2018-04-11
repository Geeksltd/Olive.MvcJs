export default class Select {
     
    public static enableEnhance(selector:JQuery){selector.each((i,e)=> this.enhance($(e)));}
     
    static enhance(selectControl: JQuery) {
        selectControl.chosen({ disable_search_threshold: 5, width: "auto" });
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
