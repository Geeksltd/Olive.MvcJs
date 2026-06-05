define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfirmBox = void 0;
    class ConfirmBoxFactory {
        enable(selector) {
            selector.each((i, e) => new ConfirmBox($(e)).enable());
        }
    }
    exports.default = ConfirmBoxFactory;
    class ConfirmBox {
        constructor(button) {
            this.button = button;
        }
        enable() {
            this.button
                .off("click.confirm-question")
                .bindFirst("click.confirm-question", (e) => {
                e.stopImmediatePropagation();
                this.setButtonsLabel(this.button.attr("data-confirm-ok") || "OK", this.button.attr("data-confirm-cancel") || "Cancel");
                this.showConfirm(this.button.attr("data-confirm-question"), () => {
                    this.button.off("click.confirm-question");
                    this.button.trigger("click");
                    this.enable();
                });
                return false;
            });
        }
        setButtonsLabel(ok, cancel) {
            alertify.set({ labels: { ok, cancel } });
        }
        showConfirm(text, yesCallback) {
            alertify.confirm(text.replace(/\r/g, "<br />"), (e) => {
                if (e)
                    yesCallback();
                else
                    return false;
            });
        }
    }
    exports.ConfirmBox = ConfirmBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybUJveC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2NvbmZpcm1Cb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUFBLE1BQXFCLGlCQUFpQjtRQUM3QixNQUFNLENBQUMsUUFBZ0I7WUFDNUIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDekQsQ0FBQztLQUNGO0lBSkQsb0NBSUM7SUFFRCxNQUFhLFVBQVU7UUFDckIsWUFBc0IsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBRyxDQUFDO1FBRWpDLE1BQU07WUFDWCxJQUFJLENBQUMsTUFBTTtpQkFDUixHQUFHLENBQUMsd0JBQXdCLENBQUM7aUJBQzdCLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN6QyxDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFFN0IsSUFBSSxDQUFDLGVBQWUsQ0FDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxJQUFJLEVBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksUUFBUSxDQUNwRCxDQUFDO2dCQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxHQUFHLEVBQUU7b0JBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7b0JBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hCLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sS0FBSyxDQUFDO1lBQ2YsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sZUFBZSxDQUFDLEVBQVUsRUFBRSxNQUFjO1lBQy9DLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFTSxXQUFXLENBQUMsSUFBWSxFQUFFLFdBQXVCO1lBQ3RELFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEQsSUFBSSxDQUFDO29CQUFFLFdBQVcsRUFBRSxDQUFDOztvQkFDaEIsT0FBTyxLQUFLLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Y7SUFsQ0QsZ0NBa0NDIn0=