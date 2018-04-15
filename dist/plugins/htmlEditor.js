define(["require", "exports", "olive/config", "olive/components/modal"], function (require, exports, config_1, modal_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var HtmlEditor = /** @class */ (function () {
        function HtmlEditor(targetInput) {
            this.input = targetInput;
        }
        HtmlEditor.enable = function (selector) { selector.each(function (i, e) { return new HtmlEditor($(e)).enable(); }); };
        HtmlEditor.prototype.enable = function () {
            var _this = this;
            window["CKEDITOR_BASEPATH"] = config_1.default.CK_EDITOR_BASE_PATH;
            $.getScript(config_1.default.CK_EDITOR_BASE_PATH + "ckeditor.js", function () { return _this.onCkEditorScriptReady(); });
        };
        HtmlEditor.prototype.onCkEditorScriptReady = function () {
            CKEDITOR.basePath = config_1.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_1.default.CK_EDITOR_BASE_PATH + 'contents.css';
            var editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());
            editor.on('change', function (evt) { return evt.editor.updateElement(); });
            editor.on("instanceReady", function (event) { return modal_1.default.adjustHeight(); });
        };
        HtmlEditor.prototype.getEditorSettings = function () {
            return {
                toolbar: this.input.attr('data-toolbar') || config_1.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: '/Scripts/ckeditor_config.js'
            };
        };
        return HtmlEditor;
    }());
    exports.default = HtmlEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2h0bWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQU1JLG9CQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFKYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQTdCLENBQTZCLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFNakcsMkJBQU0sR0FBTjtZQUFBLGlCQUdDO1lBRkcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsQ0FBQztZQUN6RCxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFNLENBQUMsbUJBQW1CLEdBQUcsYUFBYSxFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCwwQ0FBcUIsR0FBckI7WUFDSSxRQUFRLENBQUMsUUFBUSxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7WUFFL0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUM7WUFFMUUsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsZUFBSyxDQUFDLFlBQVksRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELHNDQUFpQixHQUFqQjtZQUNJLE1BQU0sQ0FBQztnQkFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksZ0JBQU0sQ0FBQyx3QkFBd0I7Z0JBQzNFLFlBQVksRUFBRSw2QkFBNkI7YUFDOUMsQ0FBQztRQUNOLENBQUM7UUFDTCxpQkFBQztJQUFELENBQUMsQUFoQ0QsSUFnQ0MifQ==