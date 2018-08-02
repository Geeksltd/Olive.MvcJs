import Config from "olive/config"
import Alert from "olive/components/alert";

export default class Validate {

    public static configure() {

        let methods: any = $.validator.methods;

        let format = Config.DATE_FORMAT;

        methods.date = function (value, element) {
            if (this.optional(element)) return true;
            return moment(value, format).isValid();
        }

        // TODO: datetime, time
    }

    public static validateForm(trigger) {

        if (trigger.is("[formnovalidate]")) return true;
        let form = trigger.closest("form");
        let validator = form.validate();

        if (!validator.form()) {
            let alertUntyped: any = alert;
            if (form.is("[data-validation-style*=message-box]"))
                alertUntyped(validator.errorList.map(err => err.message).join('\r\n'),
                    () => { setTimeout(() => validator.focusInvalid(), 0); });
            validator.focusInvalid();

            let errorMessage: string = "";

            $.each(validator.errorList, (index, item) => {
                if(!$(".tooltip:contains('"+ item.message +"')"))
                    errorMessage += item.message + "<br/>";
            });

            if(errorMessage.length > 0)
                Alert.alert(errorMessage, "error");

            return false;
        }
        return true;
    }

    public static reloadRules(form: JQuery) {
        form.removeData("validator").removeData("unobtrusiveValidation");
        //$.validator.unobtrusive.parse(form);
    }

}
