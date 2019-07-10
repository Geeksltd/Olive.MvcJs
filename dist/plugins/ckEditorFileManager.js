define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CKEditorFileManagerFactory = /** @class */ (function () {
        function CKEditorFileManagerFactory(url) {
            this.url = url;
        }
        CKEditorFileManagerFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new CKEditorFileManager($(e), _this.url).enable(); });
        };
        return CKEditorFileManagerFactory;
    }());
    exports.CKEditorFileManagerFactory = CKEditorFileManagerFactory;
    var CKEditorFileManager = /** @class */ (function () {
        function CKEditorFileManager(item, url) {
            this.item = item;
            this.url = url;
        }
        CKEditorFileManager.prototype.enable = function () {
            var _this = this;
            this.item.on('click', function () {
                var uri = _this.item.data('download-uri');
                window.opener.CKEDITOR.tools.callFunction(_this.url.getQuery('CKEditorFuncNum'), uri);
                window.close();
            });
        };
        return CKEditorFileManager;
    }());
    exports.default = CKEditorFileManager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tFZGl0b3JGaWxlTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2NrRWRpdG9yRmlsZU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFFQTtRQUVJLG9DQUFvQixHQUFRO1lBQVIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFJLENBQUM7UUFFMUIsMkNBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUE4RztZQUE1RSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBaEQsQ0FBZ0QsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUNsSCxpQ0FBQztJQUFELENBQUMsQUFMRCxJQUtDO0lBTFksZ0VBQTBCO0lBTXZDO1FBQ0ksNkJBQW9CLElBQVksRUFBVSxHQUFRO1lBQTlCLFNBQUksR0FBSixJQUFJLENBQVE7WUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBQUksQ0FBQztRQUV2RCxvQ0FBTSxHQUFOO1lBQUEsaUJBTUM7WUFMRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQU0sR0FBRyxHQUFHLEtBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3JGLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDTCwwQkFBQztJQUFELENBQUMsQUFWRCxJQVVDIn0=