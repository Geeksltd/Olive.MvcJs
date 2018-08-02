define(["require", "exports", "olive/config", "olive/components/alert"], function (require, exports, config_1, alert_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Validate = /** @class */ (function () {
        function Validate() {
        }
        Validate.configure = function () {
            var methods = $.validator.methods;
            var format = config_1.default.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element))
                    return true;
                return moment(value, format).isValid();
            };
            // TODO: datetime, time
        };
        Validate.validateForm = function (trigger) {
            if (trigger.is("[formnovalidate]"))
                return true;
            var form = trigger.closest("form");
            var validator = form.validate();
            if (!validator.form()) {
                var alertUntyped = alert;
                if (form.is("[data-validation-style*=message-box]"))
                    alertUntyped(validator.errorList.map(function (err) { return err.message; }).join('\r\n'), function () { setTimeout(function () { return validator.focusInvalid(); }, 0); });
                validator.focusInvalid();
                var errorMessage_1 = "";
                $.each(validator.errorList, function (index, item) {
                    if (!$(".tooltip:contains('" + item.message + "')"))
                        errorMessage_1 += item.message + "<br/>";
                });
                if (errorMessage_1.length > 0)
                    alert_1.default.alert(errorMessage_1, "error");
                return false;
            }
            return true;
        };
        Validate.reloadRules = function (form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            //$.validator.unobtrusive.parse(form);
        };
        return Validate;
    }());
    exports.default = Validate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBQUE7UUFpREEsQ0FBQztRQS9DaUIsa0JBQVMsR0FBdkI7WUFFSSxJQUFJLE9BQU8sR0FBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztZQUVoQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsS0FBSyxFQUFFLE9BQU87Z0JBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFBO1lBRUQsdUJBQXVCO1FBQzNCLENBQUM7UUFFYSxxQkFBWSxHQUExQixVQUEyQixPQUFPO1lBRTlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2hELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxZQUFZLEdBQVEsS0FBSyxDQUFDO2dCQUM5QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7b0JBQ2hELFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxPQUFPLEVBQVgsQ0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNqRSxjQUFRLFVBQVUsQ0FBQyxjQUFNLE9BQUEsU0FBUyxDQUFDLFlBQVksRUFBRSxFQUF4QixDQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFFekIsSUFBSSxjQUFZLEdBQVcsRUFBRSxDQUFDO2dCQUU5QixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLLEVBQUUsSUFBSTtvQkFDcEMsRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEdBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRSxJQUFJLENBQUMsQ0FBQzt3QkFDN0MsY0FBWSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUEsQ0FBQyxjQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDdkIsZUFBSyxDQUFDLEtBQUssQ0FBQyxjQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRXZDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVhLG9CQUFXLEdBQXpCLFVBQTBCLElBQVk7WUFDbEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNqRSxzQ0FBc0M7UUFDMUMsQ0FBQztRQUVMLGVBQUM7SUFBRCxDQUFDLEFBakRELElBaURDIn0=