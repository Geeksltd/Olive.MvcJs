define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var UserHelp = /** @class */ (function () {
        function UserHelp(element) {
            element.click(function () { return false; });
            var message = element.attr('data-user-help');
            element['popover']({ trigger: 'focus', content: message, html: true });
        }
        UserHelp.enable = function (selector) { selector.each(function (i, e) { return new UserHelp($(e)); }); };
        return UserHelp;
    }());
    exports.default = UserHelp;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckhlbHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy91c2VySGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBR0ksa0JBQVksT0FBZTtZQUN2QixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSyxDQUFDLENBQUM7WUFDM0IsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBTmEsZUFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFPM0YsZUFBQztJQUFELENBQUMsQUFSRCxJQVFDIn0=