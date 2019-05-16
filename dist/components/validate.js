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
        Validate.removeTooltipsRelatedTo = function (parent) {
            parent.find('[aria-describedby]').each(function (_, elem) {
                var id = $(elem).attr('aria-describedby');
                $("body > #" + id + ".tooltip").tooltip('hide');
            });
        };
        return Validate;
    }());
    exports.default = Validate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUlBO1FBQUE7UUFpRUEsQ0FBQztRQTlEaUIsa0JBQVMsR0FBdkI7WUFFSSxJQUFJLE9BQU8sR0FBUSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUV2QyxJQUFJLE1BQU0sR0FBRyxnQkFBTSxDQUFDLFdBQVcsQ0FBQztZQUVoQyxPQUFPLENBQUMsSUFBSSxHQUFHLFVBQVUsS0FBSyxFQUFFLE9BQU87Z0JBQ25DLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7Z0JBQ3hDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUE7WUFFRCx1QkFBdUI7UUFDM0IsQ0FBQztRQUVhLDBCQUFpQixHQUEvQixVQUFnQyxPQUFzQjtZQUNsRCxRQUFRLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQztRQUN0QyxDQUFDO1FBRWEscUJBQVksR0FBMUIsVUFBMkIsT0FBZTtZQUV0QyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDaEQsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFFaEMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN6QixlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLGNBQWMsRUFBRTthQUN0RCxDQUFDLENBQUE7WUFFRixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNuQixJQUFJLFlBQVksR0FBUSxLQUFLLENBQUM7Z0JBQzlCLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQztvQkFDL0MsWUFBWSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsR0FBRyxDQUFDLE9BQU8sRUFBWCxDQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQ2pFLGNBQVEsVUFBVSxDQUFDLGNBQU0sT0FBQSxTQUFTLENBQUMsWUFBWSxFQUFFLEVBQXhCLENBQXdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUV6QixJQUFJLGNBQVksR0FBVyxFQUFFLENBQUM7Z0JBRTlCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxVQUFDLEtBQUssRUFBRSxJQUFJO29CQUNwQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUMvQyxjQUFZLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQy9DLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksY0FBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO29CQUN2QixlQUFLLENBQUMsS0FBSyxDQUFDLGNBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFdkMsT0FBTyxLQUFLLENBQUM7YUFDaEI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRWEsb0JBQVcsR0FBekIsVUFBMEIsSUFBWTtZQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ2pFLHNDQUFzQztRQUMxQyxDQUFDO1FBRWEsZ0NBQXVCLEdBQXJDLFVBQXNDLE1BQWM7WUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxJQUFJO2dCQUMzQyxJQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRTVDLENBQUMsQ0FBQyxhQUFXLEVBQUUsYUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGVBQUM7SUFBRCxDQUFDLEFBakVELElBaUVDIn0=