export default class Select {
     
    public static enableEnhance(selector:JQuery){selector.each((i,e)=> this.enhance($(e)));}
     
    static enhance(selectControl: JQuery) {
        selectControl.chosen({ disable_search_threshold: 5, width: "100%" });
        //this fix chosen issue with jQuery validation (https://github.com/harvesthq/chosen/issues/515#issuecomment-33214050)
        $('select').each(function (index) {
            this.setAttribute('style', 'display:visible; position:absolute; clip:rect(0,0,0,0)');
        });
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
