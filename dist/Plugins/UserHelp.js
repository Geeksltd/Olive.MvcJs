define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var UserHelp = /** @class */ (function () {
        function UserHelp(targetElement) {
            this.element = targetElement;
            this.element.click(function () { return false; });
            var message = this.element.attr('data-user-help'); // todo: unescape message and conver to html
            this.element['popover']({ trigger: 'focus', content: message });
        }
        UserHelp.enable = function (selector) { selector.each(function (i, e) { return new UserHelp($(e)); }); };
        return UserHelp;
    }());
    exports.default = UserHelp;
});
//# sourceMappingURL=UserHelp.js.map