define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiSelect = /** @class */ (function () {
        function MultiSelect() {
        }
        MultiSelect.enableEnhance = function (selector) {
            var _this = this;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        MultiSelect.setOptions = function (options) {
            MultiSelect.options = $.extend(MultiSelect.defaultOptions, options);
        };
        MultiSelect.enhance = function (selectControl) {
            selectControl.selectpicker(MultiSelect.options);
        };
        //https://developer.snapappointments.com/bootstrap-select/
        MultiSelect.defaultOptions = {
            actionsBox: true,
            liveSearch: true,
            selectedTextFormat: "count"
        };
        MultiSelect.options = MultiSelect.defaultOptions;
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBO1FBQUE7UUFzQkEsQ0FBQztRQWJlLHlCQUFhLEdBQTNCLFVBQTRCLFFBQWdCO1lBQTVDLGlCQUlDO1lBSEMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVk7Z0JBQ25CLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7WUFDdkQsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVhLHNCQUFVLEdBQXhCLFVBQXlCLE9BQVk7WUFDbkMsV0FBVyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDckUsQ0FBQztRQUVNLG1CQUFPLEdBQWQsVUFBZSxhQUFxQjtZQUNsQyxhQUFhLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBcEJELDBEQUEwRDtRQUMzQywwQkFBYyxHQUFHO1lBQzlCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGtCQUFrQixFQUFFLE9BQU87U0FDNUIsQ0FBQztRQUNhLG1CQUFPLEdBQVEsV0FBVyxDQUFDLGNBQWMsQ0FBQztRQWUzRCxrQkFBQztLQUFBLEFBdEJELElBc0JDO3NCQXRCb0IsV0FBVyJ9