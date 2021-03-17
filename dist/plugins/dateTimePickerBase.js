var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    config_1 = __importDefault(config_1);
    var dateTimePickerBase = /** @class */ (function () {
        function dateTimePickerBase(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        dateTimePickerBase.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.data("control");
            var stepping = Number(this.input.data("minute-steps") || "1");
            if (control == this.controlType) {
                var options = {
                    format: this.format,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: {
                        today: "fas fa-calendar-check",
                        clear: "fas fa-eraser",
                        time: "fas fa-clock",
                        date: "fas fa-calendar-alt",
                        up: "fas fa-chevron-up",
                        down: "fas fa-chevron-down",
                        next: "fas fa-chevron-right",
                        previous: "fas fa-chevron-left"
                    },
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: config_1.default.DATE_LOCALE,
                    stepping: stepping
                };
                this.modifyOptions(options);
                this.input.datetimepicker(options);
                // Now make calendar icon clickable as well             
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(function () { return _this.input.focus(); });
            }
            else
                alert("Don't know how to handle date control of " + control);
        };
        return dateTimePickerBase;
    }());
    exports.default = dateTimePickerBase;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZVRpbWVQaWNrZXJCYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZGF0ZVRpbWVQaWNrZXJCYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQUdBO1FBSUksNEJBQXNCLEtBQWEsRUFBVSxXQUF3QjtZQUEvQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBSW5FLGlDQUFJLEdBQVg7WUFBQSxpQkF1Q0M7WUFyQ0csSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsRUFBckMsQ0FBcUMsQ0FBQyxDQUFDO2dCQUM5RyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQzthQUNqSDtZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUVoRSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUM3QixJQUFNLE9BQU8sR0FBRztvQkFDWixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLFVBQVUsRUFBRSxLQUFLO29CQUNqQixlQUFlLEVBQUUsSUFBSTtvQkFDckIsS0FBSyxFQUFFO3dCQUNILEtBQUssRUFBRSx1QkFBdUI7d0JBQzlCLEtBQUssRUFBRSxlQUFlO3dCQUN0QixJQUFJLEVBQUUsY0FBYzt3QkFDcEIsSUFBSSxFQUFFLHFCQUFxQjt3QkFDM0IsRUFBRSxFQUFFLG1CQUFtQjt3QkFDdkIsSUFBSSxFQUFFLHFCQUFxQjt3QkFDM0IsSUFBSSxFQUFFLHNCQUFzQjt3QkFDNUIsUUFBUSxFQUFFLHFCQUFxQjtxQkFDbEM7b0JBQ0QsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUNoRixNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO29CQUMxQixRQUFRLEVBQUUsUUFBUTtpQkFDckIsQ0FBQztnQkFFRixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU1QixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbkMsd0RBQXdEO2dCQUN4RCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQWxCLENBQWtCLENBQUMsQ0FBQzthQUN6Rzs7Z0JBQ0ksS0FBSyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFDTCx5QkFBQztJQUFELENBQUMsQUFoREQsSUFnREMifQ==