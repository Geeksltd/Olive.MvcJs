define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SanityAdapter = /** @class */ (function () {
        function SanityAdapter() {
        }
        SanityAdapter.enable = function () {
            var _this = this;
            $(window).off('click.SanityAdapter').on('click.SanityAdapter', function (e) { return _this.skipNewWindows(e); });
        };
        SanityAdapter.skipNewWindows = function (element) {
            $(element.target).filter('a').removeAttr('target');
            window["open"] = function (url, r, f, re) { location.replace(url); return window; };
        };
        return SanityAdapter;
    }());
    exports.default = SanityAdapter;
});
//# sourceMappingURL=SanityAdapter.js.map