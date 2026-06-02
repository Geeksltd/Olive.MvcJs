define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Bootstrap 5 compatibility helpers for Olive.MvcJs.
     * Centralizes modal/tooltip usage so host apps can upgrade Bootstrap without scattered changes.
     */
    class BootstrapAdapter {
        static showModal(element) {
            var _a;
            if ((_a = window.bootstrap) === null || _a === void 0 ? void 0 : _a.Modal) {
                const instance = window.bootstrap.Modal.getOrCreateInstance(element[0]);
                instance.show();
                return;
            }
            element.modal("show");
        }
        static hideModal(element) {
            var _a;
            if ((_a = window.bootstrap) === null || _a === void 0 ? void 0 : _a.Modal) {
                const instance = window.bootstrap.Modal.getInstance(element[0]);
                if (instance) {
                    instance.hide();
                    return;
                }
            }
            element.modal("hide");
        }
        static ensureTooltipCompatibility() {
            const tooltipFn = $.fn.tooltip;
            if (tooltipFn && !tooltipFn.Constructor) {
                tooltipFn.Constructor = {};
            }
        }
        static getDateTimePickerWidgetSelector() {
            return ".tempus-dominus-widget, .bootstrap-datetimepicker-widget";
        }
    }
    exports.default = BootstrapAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkYXB0ZXJzL2Jvb3RzdHJhcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTs7O09BR0c7SUFDSCxNQUFxQixnQkFBZ0I7UUFFMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFlOztZQUNuQyxJQUFJLE1BQUEsTUFBTSxDQUFDLFNBQVMsMENBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87WUFDWCxDQUFDO1lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBRU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFlOztZQUNuQyxJQUFJLE1BQUEsTUFBTSxDQUFDLFNBQVMsMENBQUUsS0FBSyxFQUFFLENBQUM7Z0JBQzFCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDWCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2hCLE9BQU87Z0JBQ1gsQ0FBQztZQUNMLENBQUM7WUFDRCxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFFTSxNQUFNLENBQUMsMEJBQTBCO1lBQ3BDLE1BQU0sU0FBUyxHQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3BDLElBQUksU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QyxTQUFTLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQztRQUVNLE1BQU0sQ0FBQywrQkFBK0I7WUFDekMsT0FBTywwREFBMEQsQ0FBQztRQUN0RSxDQUFDO0tBQ0o7SUFoQ0QsbUNBZ0NDIn0=