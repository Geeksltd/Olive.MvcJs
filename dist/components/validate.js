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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBQUE7UUFpREEsQ0FBQztRQS9DaUIsa0JBQVMsR0FBdkI7WUFFSSxJQUFJLE9BQU8sR0FBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztZQUVoQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsS0FBSyxFQUFFLE9BQU87Z0JBQ25DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3hDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUE7WUFFRCx1QkFBdUI7UUFDM0IsQ0FBQztRQUVhLHFCQUFZLEdBQTFCLFVBQTJCLE9BQU87WUFFOUIsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ2hELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ25CLElBQUksWUFBWSxHQUFRLEtBQUssQ0FBQztnQkFDOUIsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLHNDQUFzQyxDQUFDO29CQUMvQyxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsT0FBTyxFQUFYLENBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDakUsY0FBUSxVQUFVLENBQUMsY0FBTSxPQUFBLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBeEIsQ0FBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRXpCLElBQUksY0FBWSxHQUFXLEVBQUUsQ0FBQztnQkFFOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFVBQUMsS0FBSyxFQUFFLElBQUk7b0JBQ3BDLElBQUcsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEdBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRSxJQUFJLENBQUM7d0JBQzVDLGNBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBRyxjQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7b0JBQ3RCLGVBQUssQ0FBQyxLQUFLLENBQUMsY0FBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUV2QyxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFYSxvQkFBVyxHQUF6QixVQUEwQixJQUFZO1lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakUsc0NBQXNDO1FBQzFDLENBQUM7UUFFTCxlQUFDO0lBQUQsQ0FBQyxBQWpERCxJQWlEQyJ9