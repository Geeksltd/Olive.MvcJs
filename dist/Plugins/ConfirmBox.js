exports.__esModule = true;
var ConfirmBox = /** @class */ (function () {
    function ConfirmBox(targetButton) {
        this.button = targetButton;
    }
    ConfirmBox.prototype.enable = function () {
        var _this = this;
        this.button.off("click.confirm-question").bindFirst("click.confirm-question", function (e) {
            e.stopImmediatePropagation();
            //return false;
            alertify.set({
                labels: { ok: _this.button.attr('data-confirm-ok') || 'OK', cancel: _this.button.attr('data-confirm-cancel') || 'Cancel' }
            });
            _this.showConfirm(_this.button.attr('data-confirm-question'), function () {
                _this.button.off("click.confirm-question");
                _this.button.trigger('click');
                _this.enable();
            });
            return false;
        });
    };
    ConfirmBox.prototype.showConfirm = function (text, yesCallback) {
        alertify.confirm(text.replace(/\r/g, "<br />"), function (e) {
            if (e)
                yesCallback();
            else
                return false;
        });
    };
    return ConfirmBox;
}());
exports.ConfirmBox = ConfirmBox;
//# sourceMappingURL=ConfirmBox.js.map