define(["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiSelect = /** @class */ (function () {
        function MultiSelect() {
            //https://developer.snapappointments.com/bootstrap-select/
            /// TODO: this fields are obsolete and DI should use instead.
            this.defaultOptions = {
                actionsBox: true,
                liveSearch: true,
                selectedTextFormat: "count"
            };
            this.options = this.defaultOptions;
        }
        MultiSelect.prototype.enableEnhance = function (selector) {
            var _this = this;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        /// TODO: this method is obsolete and DI should use instead.
        MultiSelect.prototype.setOptions = function (options) {
            console.log('MultiSelect.setOptions is obsolete and will be removed in next version.');
            this.options = $.extend(this.defaultOptions, options);
        };
        MultiSelect.prototype.enhance = function (selectControl) {
            selectControl.selectpicker(this.options);
        };
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlTZWxlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBO1FBQUE7WUFDSSwwREFBMEQ7WUFFMUQsNkRBQTZEO1lBQ3JELG1CQUFjLEdBQUc7Z0JBQ3JCLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixVQUFVLEVBQUUsSUFBSTtnQkFDaEIsa0JBQWtCLEVBQUUsT0FBTzthQUM5QixDQUFDO1lBQ00sWUFBTyxHQUFRLElBQUksQ0FBQyxjQUFjLENBQUM7UUFpQi9DLENBQUM7UUFmRyxtQ0FBYSxHQUFiLFVBQWMsUUFBZ0I7WUFBOUIsaUJBSUM7WUFIRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWTtnQkFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztZQUN6RCxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBRUQsNERBQTREO1FBQzVELGdDQUFVLEdBQVYsVUFBVyxPQUFZO1lBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMseUVBQXlFLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN6RCxDQUFDO1FBRU8sNkJBQU8sR0FBZixVQUFnQixhQUFxQjtZQUNqQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQUFDLEFBMUJELElBMEJDIn0=