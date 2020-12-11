define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfirmBox = void 0;
    var ConfirmBoxFactory = /** @class */ (function () {
        function ConfirmBoxFactory() {
        }
        ConfirmBoxFactory.prototype.enable = function (selector) { selector.each(function (i, e) { return new ConfirmBox($(e)).enable(); }); };
        return ConfirmBoxFactory;
    }());
    exports.default = ConfirmBoxFactory;
    var ConfirmBox = /** @class */ (function () {
        function ConfirmBox(button) {
            this.button = button;
        }
        ConfirmBox.prototype.enable = function () {
            var _this = this;
            this.button.off("click.confirm-question").bindFirst("click.confirm-question", function (e) {
                e.stopImmediatePropagation();
                _this.setButtonsLabel(_this.button.attr('data-confirm-ok') || 'OK', _this.button.attr('data-confirm-cancel') || 'Cancel');
                _this.showConfirm(_this.button.attr('data-confirm-question'), function () {
                    _this.button.off("click.confirm-question");
                    _this.button.trigger('click');
                    _this.enable();
                });
                return false;
            });
        };
        ConfirmBox.prototype.setButtonsLabel = function (ok, cancel) {
            alertify.set({ labels: { ok: ok, cancel: cancel } });
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybUJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2NvbmZpcm1Cb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUE7UUFBQTtRQUVBLENBQUM7UUFEVSxrQ0FBTSxHQUFiLFVBQWMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUE3QixDQUE2QixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9GLHdCQUFDO0lBQUQsQ0FBQyxBQUZELElBRUM7O0lBRUQ7UUFDSSxvQkFBc0IsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBSSxDQUFDO1FBRWxDLDJCQUFNLEdBQWI7WUFBQSxpQkFpQkM7WUFoQkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsVUFBQSxDQUFDO2dCQUMzRSxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFFN0IsS0FBSSxDQUFDLGVBQWUsQ0FDaEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxJQUFJLEVBQzNDLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksUUFBUSxDQUN0RCxDQUFDO2dCQUVGLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRTtvQkFDeEQsS0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztvQkFDMUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzdCLEtBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sb0NBQWUsR0FBdEIsVUFBdUIsRUFBVSxFQUFFLE1BQWM7WUFDN0MsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFTSxnQ0FBVyxHQUFsQixVQUFtQixJQUFZLEVBQUUsV0FBdUI7WUFDcEQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxVQUFBLENBQUM7Z0JBQzdDLElBQUksQ0FBQztvQkFBRSxXQUFXLEVBQUUsQ0FBQzs7b0JBQ2hCLE9BQU8sS0FBSyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FBQyxBQWhDRCxJQWdDQztJQWhDWSxnQ0FBVSJ9