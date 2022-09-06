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
                if (this.optional(element)) {
                    return true;
                }
                return moment(value, format).isValid();
            };
            var originalNumberMehtod = methods.number;
            var originalMinMehtod = methods.min;
            var originalMaxMehtod = methods.max;
            var originalRangeMehtod = methods.range;
            var clearMaskedNumber = function (value) { return value.replace(/,/g, ""); };
            methods.number = function (value, element) {
                return originalNumberMehtod.call(this, value, element);
            };
            methods.min = function (value, element, param) {
                return originalMinMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.max = function (value, element, param) {
                return originalMaxMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.range = function (value, element, param) {
                return originalRangeMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            // TODO: datetime, time
        };
        Validate.prototype.initialize = function () {
            var _this = this;
            this.responseProcessor.subformChanged.handle(function (data) { return _this.reloadRules(data.trigger.parents("form")); });
        };
        /// TODO: this method is obsolete and DI should use instead.
        Validate.prototype.setTooltipOptions = function (options) {
            console.warn("MultiSelect.setOptions is obsolete and will be removed in next version.");
            this.tooltipOptions = options;
        };
        Validate.prototype.validateForm = function (trigger) {
            if (!this.needsValidation(trigger)) {
                return true;
            }
            var form = this.getForm(trigger);
            var validator = this.getValidator(trigger, form);
            this.extendValidatorSettings(validator, trigger);
            if (!validator.form()) {
                this.handleInvalidForm(validator, form, trigger);
                return false;
            }
            return true;
        };
        Validate.prototype.reloadRules = function (form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            // $.validator.unobtrusive.parse(form);
        };
        Validate.prototype.removeTooltipsRelatedTo = function (parent) {
            parent.find("[aria-describedby]").each(function (_, elem) {
                var id = $(elem).attr("aria-describedby");
                $("body > #".concat(id, ".tooltip")).tooltip("hide");
            });
        };
        Validate.prototype.needsValidation = function (trigger) {
            return !trigger.is("[formnovalidate]");
        };
        Validate.prototype.getForm = function (trigger) {
            return trigger.closest("form");
        };
        Validate.prototype.getValidator = function (trigger, form) {
            return form.validate();
        };
        Validate.prototype.extendValidatorSettings = function (validator, trigger) {
            $.extend(validator.settings, {
                tooltip_options: { _all_: this.tooltipOptions },
            });
        };
        Validate.prototype.focusOnInvalid = function (validator, form, trigger) {
            validator.focusInvalid();
        };
        Validate.prototype.showAdditionalErrors = function (validator) {
            var errorMessage = "";
            $.each(validator.errorList, function (_, item) {
                if (!$(".tooltip:contains('" + item.message + "')")) {
                    errorMessage += item.message + "<br/>";
                }
            });
            if (errorMessage.length > 0) {
                this.alert.alert(errorMessage, "error");
            }
        };
        Validate.prototype.handleMessageBoxStyle = function (validator, form, trigger) {
            var _this = this;
            var alertUntyped = alert;
            if (form.is("[data-validation-style*=message-box]")) {
                alertUntyped(validator.errorList.map(function (err) { return err.message; }).join("\r\n"), function () { setTimeout(function () { return _this.focusOnInvalid(validator, form, trigger); }, 0); });
            }
        };
        Validate.prototype.handleInvalidForm = function (validator, form, trigger) {
            this.handleMessageBoxStyle(validator, form, trigger);
            this.focusOnInvalid(validator, form, trigger);
            this.showAdditionalErrors(validator);
        };
        return Validate;
    }());
    exports.default = Validate;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUtBO1FBSUksa0JBQW9CLEtBQVksRUFBVSxpQkFBb0M7WUFBMUQsVUFBSyxHQUFMLEtBQUssQ0FBTztZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFBSSxDQUFDO1FBRTVFLDRCQUFTLEdBQWhCO1lBRUksSUFBTSxPQUFPLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFekMsSUFBTSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxXQUFXLENBQUM7WUFFbEMsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQUUsT0FBTyxJQUFJLENBQUM7aUJBQUU7Z0JBQzVDLE9BQU8sTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUM7WUFFRixJQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUMsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3RDLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN0QyxJQUFNLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFMUMsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEtBQWEsSUFBSyxPQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUF2QixDQUF1QixDQUFDO1lBRXJFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFhLEVBQUUsT0FBWTtnQkFDbEQsT0FBTyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFB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