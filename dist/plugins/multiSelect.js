define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiSelect = /** @class */ (function () {
        function MultiSelect() {
        }
        //https://developer.snapappointments.com/bootstrap-select/
        MultiSelect.enableEnhance = function (selector) {
            var _this = this;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        MultiSelect.enhance = function (selectControl) {
            selectControl.selectpicker({
                actionsBox: true,
                liveSearch: true,
                selectedTextFormat: "count"
            });
        };
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBO1FBQUE7UUFpQkEsQ0FBQztRQWhCQywwREFBMEQ7UUFFNUMseUJBQWEsR0FBM0IsVUFBNEIsUUFBZ0I7WUFBNUMsaUJBSUM7WUFIQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztZQUN2RCxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRU0sbUJBQU8sR0FBZCxVQUFlLGFBQXFCO1lBRWxDLGFBQWEsQ0FBQyxZQUFZLENBQUM7Z0JBQ3pCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsa0JBQWtCLEVBQUUsT0FBTzthQUM1QixDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBakJELElBaUJDIn0=