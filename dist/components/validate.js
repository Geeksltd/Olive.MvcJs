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
        Validate.setTooltipOptions = function (options) {
            Validate.tooltipOptions = options;
        };
        Validate.validateForm = function (trigger) {
            if (trigger.is("[formnovalidate]"))
                return true;
            var form = trigger.closest("form");
            var validator = form.validate();
            $.extend(validator.settings, {
                tooltip_options: { _all_: Validate.tooltipOptions }
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUlBO1FBQUE7UUEwREEsQ0FBQztRQXZEaUIsa0JBQVMsR0FBdkI7WUFFSSxJQUFJLE9BQU8sR0FBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztZQUVoQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsS0FBSyxFQUFFLE9BQU87Z0JBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFBO1lBRUQsdUJBQXVCO1FBQzNCLENBQUM7UUFFYSwwQkFBaUIsR0FBL0IsVUFBZ0MsT0FBc0I7WUFDbEQsUUFBUSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFDdEMsQ0FBQztRQUVhLHFCQUFZLEdBQTFCLFVBQTJCLE9BQWU7WUFFdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDaEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN6QixlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRTthQUN0RCxDQUFDLENBQUE7WUFFRixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksWUFBWSxHQUFRLEtBQUssQ0FBQztnQkFDOUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO29CQUNoRCxZQUFZLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsT0FBTyxFQUFYLENBQVcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDakUsY0FBUSxVQUFVLENBQUMsY0FBTSxPQUFBLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBeEIsQ0FBd0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsRSxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRXpCLElBQUksY0FBWSxHQUFXLEVBQUUsQ0FBQztnQkFFOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLFVBQUMsS0FBSyxFQUFFLElBQUk7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUM7d0JBQ2hELGNBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDL0MsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLENBQUMsY0FBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ3hCLGVBQUssQ0FBQyxLQUFLLENBQUMsY0FBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUV2QyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFYSxvQkFBVyxHQUF6QixVQUEwQixJQUFZO1lBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakUsc0NBQXNDO1FBQzFDLENBQUM7UUFFTCxlQUFDO0lBQUQsQ0FBQyxBQTFERCxJQTBEQyJ9