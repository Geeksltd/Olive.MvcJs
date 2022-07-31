define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiSelectFactory = void 0;
    var MultiSelectFactory = /** @class */ (function () {
        function MultiSelectFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        MultiSelectFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new MultiSelect($(e), _this.modalHelper).show(); });
        };
        return MultiSelectFactory;
    }());
    exports.MultiSelectFactory = MultiSelectFactory;
    var MultiSelect = /** @class */ (function () {
        //https://developer.snapappointments.com/bootstrap-select/
        function MultiSelect(selectControl, modalHelper) {
            this.selectControl = selectControl;
            this.modalHelper = modalHelper;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
        }
        MultiSelect.prototype.show = function () {
            var maxoptions = this.selectControl.attr("max-limit") || false;
            var options = {
                actionsBox: true,
                liveSearch: true,
                selectedTextFormat: "count",
                maxOptions: maxoptions
            };
            this.selectControl.selectpicker(options);
        };
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQTtRQUNJLDRCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsbUNBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUE0RztZQUExRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQTlDLENBQThDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDaEgseUJBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLGdEQUFrQjtJQU0vQjtRQUNJLDBEQUEwRDtRQUcxRCxxQkFBc0IsYUFBcUIsRUFBVSxXQUF3QjtZQUF2RCxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3pFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZO2dCQUNqQixDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO1FBQzdELENBQUM7UUFFTSwwQkFBSSxHQUFYO1lBRUksSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDO1lBRS9ELElBQU0sT0FBTyxHQUFHO2dCQUNaLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsa0JBQWtCLEVBQUUsT0FBTztnQkFDM0IsVUFBVSxFQUFFLFVBQVU7YUFDekIsQ0FBQztZQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDTCxrQkFBQztJQUFELENBQUMsQUFyQkQsSUFxQkMifQ==