define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Select control adapter: bootstrap-select (BS5 beta) with Tom Select fallback.
     */
    class SelectAdapter {
        static initialize(selectControl, options) {
            if (this.tryBootstrapSelect(selectControl, options)) {
                return;
            }
            this.tryTomSelect(selectControl, options);
        }
        static tryBootstrapSelect(selectControl, options) {
            if (!$.fn.selectpicker) {
                return false;
            }
            if ($.fn.selectpicker.Constructor) {
                $.fn.selectpicker.Constructor.BootstrapVersion = "5";
            }
            selectControl.selectpicker(options || {});
            return true;
        }
        static tryTomSelect(selectControl, options) {
            var _a;
            const TomSelectGlobal = window.TomSelect;
            if (!TomSelectGlobal) {
                (_a = selectControl.selectpicker) === null || _a === void 0 ? void 0 : _a.call(selectControl, options || {});
                return false;
            }
            const element = selectControl[0];
            if (!element || selectControl.data("tomselect")) {
                return true;
            }
            const instance = new TomSelectGlobal(element, options || {});
            selectControl.data("tomselect", instance);
            return true;
        }
        static refresh(selectControl) {
            var _a;
            if (selectControl.data("tomselect")) {
                selectControl.data("tomselect").sync();
                return;
            }
            (_a = selectControl.selectpicker) === null || _a === void 0 ? void 0 : _a.call(selectControl, "refresh");
        }
    }
    exports.default = SelectAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0QWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hZGFwdGVycy9zZWxlY3RBZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBOztPQUVHO0lBQ0gsTUFBcUIsYUFBYTtRQUV2QixNQUFNLENBQUMsVUFBVSxDQUFDLGFBQXFCLEVBQUUsT0FBYTtZQUN6RCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsT0FBTztZQUNYLENBQUM7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLGFBQXFCLEVBQUUsT0FBYTtZQUNsRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDckIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7WUFDekQsQ0FBQztZQUNELGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQXFCLEVBQUUsT0FBYTs7WUFDNUQsTUFBTSxlQUFlLEdBQVMsTUFBYyxDQUFDLFNBQVMsQ0FBQztZQUN2RCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ25CLE1BQUEsYUFBYSxDQUFDLFlBQVksOERBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBc0IsQ0FBQztZQUN0RCxJQUFJLENBQUMsT0FBTyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztnQkFDOUMsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxPQUFPLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0QsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUMsYUFBcUI7O1lBQ3ZDLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUNsQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN2QyxPQUFPO1lBQ1gsQ0FBQztZQUNELE1BQUEsYUFBYSxDQUFDLFlBQVksOERBQUcsU0FBUyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUNKO0lBNUNELGdDQTRDQyJ9