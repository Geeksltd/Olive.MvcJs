export default class Validate{
    
    public static  validateForm(trigger) {
        
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
}
