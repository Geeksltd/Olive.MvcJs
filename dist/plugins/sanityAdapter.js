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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuaXR5QWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL3Nhbml0eUFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQTtRQUFBO1FBU0EsQ0FBQztRQVBhLG9CQUFNLEdBQXBCO1lBQUEsaUJBQWtIO1lBQTNGLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUMsVUFBQSxDQUFDLElBQUcsT0FBQSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUF0QixDQUFzQixDQUFDLENBQUM7UUFBQSxDQUFDO1FBRTNHLDRCQUFjLEdBQXJCLFVBQXNCLE9BQXlCO1lBQzNDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQUVELG9CQUFDO0lBQUQsQ0FBQyxBQVRELElBU0MifQ==