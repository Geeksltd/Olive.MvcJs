define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Validate = /** @class */ (function () {
        function Validate(alert, responseProcessor) {
            this.alert = alert;
            this.responseProcessor = responseProcessor;
        }
        Validate.prototype.configure = function () {
            var methods = $.validator.methods;
            var format = config_1.default.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element))
                    return true;
                return moment(value, format).isValid();
            };
            // TODO: datetime, time
        };
        Validate.prototype.initialize = function () {
            var _this = this;
            this.responseProcessor.subformChanged.handle(function (data) { return _this.reloadRules(data.trigger.parents("form")); });
        };
        /// TODO: this method is obsolete and DI should use instead.
        Validate.prototype.setTooltipOptions = function (options) {
            console.log('MultiSelect.setOptions is obsolete and will be removed in next version.');
            this.tooltipOptions = options;
        };
        Validate.prototype.validateForm = function (trigger) {
            if (trigger.is("[formnovalidate]"))
                return true;
            var form = trigger.closest("form");
            var validator = form.validate();
            $.extend(validator.settings, {
                tooltip_options: { _all_: this.tooltipOptions }
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
                    this.alert.alert(errorMessage_1, "error");
                return false;
            }
            return true;
        };
        Validate.prototype.reloadRules = function (form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            //$.validator.unobtrusive.parse(form);
        };
        Validate.prototype.removeTooltipsRelatedTo = function (parent) {
            parent.find('[aria-describedby]').each(function (_, elem) {
                var id = $(elem).attr('aria-describedby');
                $("body > #" + id + ".tooltip").tooltip('hide');
            });
        };
        return Validate;
    }());
    exports.default = Validate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUtBO1FBSUksa0JBQW9CLEtBQVksRUFBVSxpQkFBb0M7WUFBMUQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFBSSxDQUFDO1FBRTVFLDRCQUFTLEdBQWhCO1lBRUksSUFBSSxPQUFPLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFdkMsSUFBSSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7WUFFaEMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDO2dCQUN4QyxPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFBO1lBRUQsdUJBQXVCO1FBQzNCLENBQUM7UUFFTSw2QkFBVSxHQUFqQjtZQUFBLGlCQUVDO1lBREcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxLQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUMzRyxDQUFDO1FBRUQsNERBQTREO1FBQ3JELG9DQUFpQixHQUF4QixVQUF5QixPQUFzQjtZQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlFQUF5RSxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7UUFDbEMsQ0FBQztRQUVNLCtCQUFZLEdBQW5CLFVBQW9CLE9BQWU7WUFFL0IsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDO2dCQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ2hELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRWhDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDekIsZUFBZSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7YUFDbEQsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxZQUFZLEdBQVEsS0FBSyxDQUFDO2dCQUM5QixJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsc0NBQXNDLENBQUM7b0JBQy9DLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBSSxPQUFBLEdBQUcsQ0FBQyxPQUFPLEVBQVgsQ0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNqRSxjQUFRLFVBQVUsQ0FBQyxjQUFNLE9BQUEsU0FBUyxDQUFDLFlBQVksRUFBRSxFQUF4QixDQUF3QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFFekIsSUFBSSxjQUFZLEdBQVcsRUFBRSxDQUFDO2dCQUU5QixDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLLEVBQUUsSUFBSTtvQkFDcEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzt3QkFDL0MsY0FBWSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLGNBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUU1QyxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTSw4QkFBVyxHQUFsQixVQUFtQixJQUFZO1lBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakUsc0NBQXNDO1FBQzFDLENBQUM7UUFFTSwwQ0FBdUIsR0FBOUIsVUFBK0IsTUFBYztZQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLElBQUk7Z0JBQzNDLElBQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFFNUMsQ0FBQyxDQUFDLGFBQVcsRUFBRSxhQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQ0wsZUFBQztJQUFELENBQUMsQUExRUQsSUEwRUMifQ==