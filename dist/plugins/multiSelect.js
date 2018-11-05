define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiSelect = /** @class */ (function () {
        function MultiSelect() {
        }
        //https://developer.snapappointments.com/bootstrap-select/
        MultiSelect.enableEnhance = function (selector) {
            var _this = this;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBQUE7UUFnQkEsQ0FBQztRQWZDLDBEQUEwRDtRQUU1Qyx5QkFBYSxHQUEzQixVQUE0QixRQUFnQjtZQUE1QyxpQkFHQztZQUZDLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7WUFDckQsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVNLG1CQUFPLEdBQWQsVUFBZSxhQUFxQjtZQUVsQyxhQUFhLENBQUMsWUFBWSxDQUFDO2dCQUN6QixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGtCQUFrQixFQUFFLE9BQU87YUFDNUIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQWhCRCxJQWdCQyJ9