define(["require", "exports", "olive/components/url"], function (require, exports, url_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CKEditorFileManager = /** @class */ (function () {
        function CKEditorFileManager(item) {
            this.item = item;
        }
        CKEditorFileManager.enable = function (selector) { selector.each(function (i, e) { return new CKEditorFileManager($(e)).enable(); }); };
        CKEditorFileManager.prototype.enable = function () {
            var _this = this;
            this.item.on('click', function () {
                var uri = _this.item.data('download-uri');
                window.opener.CKEDITOR.tools.callFunction(url_1.default.getQuery('CKEditorFuncNum'), uri);
                window.close();
            });
        };
        return CKEditorFileManager;
    }());
    exports.default = CKEditorFileManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tFZGl0b3JGaWxlTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2NrRWRpdG9yRmlsZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFFQTtRQUdJLDZCQUFvQixJQUFZO1lBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFJLENBQUM7UUFGdkIsMEJBQU0sR0FBcEIsVUFBcUIsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQXRDLENBQXNDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFJM0csb0NBQU0sR0FBTjtZQUFBLGlCQU1DO1lBTEcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFO2dCQUNsQixJQUFNLEdBQUcsR0FBRyxLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDM0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxhQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDTCwwQkFBQztJQUFELENBQUMsQUFaRCxJQVlDIn0=