import Config from "olive/Config"

export default class Validate {

    public static configure() {

        var methods: any = $.validator.methods;

        var format = Config.DATE_FORMAT;

        methods.date = function (value, element) {
            if (this.optional(element)) return true;
            return moment(value, format).isValid();
        }

        // TODO: datetime, time
    }

    public static validateForm(trigger) {

        if (trigger.is("[formnovalidate]")) return true;
        var form = trigger.closest("form");
        var validator = form.validate();

        if (!validator.form()) {
            var alertUntyped: any = alert;
            if (form.is("[data-validation-style*=message-box]"))
                alertUntyped(validator.errorList.map(err => err.message).join('\r\n'), () => { setTimeout(() => validator.focusInvalid(), 0); });
            validator.focusInvalid();
            return false;
        }
        return true;
    }

    public static reloadRules(form: JQuery) {
        form.removeData("validator").removeData("unobtrusiveValidation");
        //$.validator.unobtrusive.parse(form);
    }

}