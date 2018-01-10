define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConfirmBox = /** @class */ (function () {
        function ConfirmBox(targetButton) {
            this.button = targetButton;
        }
        ConfirmBox.enable = function (selector) { selector.each(function (i, e) { return new ConfirmBox($(e)).enable(); }); };
        ConfirmBox.prototype.enable = function () {
            var _this = this;
            this.button.off("click.confirm-question").bindFirst("click.confirm-question", function (e) {
                e.stopImmediatePropagation();
                alertify.set({
                    labels: {
                        ok: _this.button.attr('data-confirm-ok') || 'OK',
                        cancel: _this.button.attr('data-confirm-cancel') || 'Cancel'
                    }
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
    exports.default = ConfirmBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlybUJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QbHVnaW5zL0NvbmZpcm1Cb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFDQTtRQUtJLG9CQUFZLFlBQWlCO1lBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7UUFBQyxDQUFDO1FBRmhELGlCQUFNLEdBQXBCLFVBQXFCLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUlsRywyQkFBTSxHQUFOO1lBQUEsaUJBa0JDO1lBakJHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLFVBQUEsQ0FBQztnQkFDM0UsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBRTdCLFFBQVEsQ0FBQyxHQUFHLENBQUM7b0JBQ1QsTUFBTSxFQUFFO3dCQUNKLEVBQUUsRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLElBQUk7d0JBQy9DLE1BQU0sRUFBRSxLQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLFFBQVE7cUJBQzlEO2lCQUNKLENBQUMsQ0FBQztnQkFFSCxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUU7b0JBQ3hELEtBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7b0JBQzFDLEtBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QixLQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sZ0NBQVcsR0FBbEIsVUFBbUIsSUFBSSxFQUFFLFdBQVc7WUFDaEMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxVQUFBLENBQUM7Z0JBQzdDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxXQUFXLEVBQUUsQ0FBQztnQkFDckIsSUFBSTtvQkFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ3RCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FBQyxBQWpDRCxJQWlDQyJ9