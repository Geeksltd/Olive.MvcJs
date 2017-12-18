define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Validate = /** @class */ (function () {
        function Validate() {
        }
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
                return false;
            }
            return true;
        };
        return Validate;
    }());
    exports.default = Validate;
});
//# sourceMappingURL=Validate.js.map