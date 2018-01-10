define(["require", "exports", "olive/Config", "olive/Components/Modal"], function (require, exports, Config_1, Modal_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var HtmlEditor = /** @class */ (function () {
        function HtmlEditor(targetInput) {
            this.input = targetInput;
        }
        HtmlEditor.enable = function (selector) { selector.each(function (i, e) { return new HtmlEditor($(e)).enable(); }); };
        HtmlEditor.prototype.enable = function () {
            $.getScript(Config_1.default.CK_EDITOR_BASE_PATH + "ckeditor.js", this.onCkEditorScriptReady);
        };
        HtmlEditor.prototype.onCkEditorScriptReady = function () {
            $.getScript(Config_1.default.CK_EDITOR_BASE_PATH + "adapters/jquery.js", this.onJQueryAdapterScriptReady);
        };
        HtmlEditor.prototype.onJQueryAdapterScriptReady = function () {
            CKEDITOR.config.contentsCss = Config_1.default.CK_EDITOR_BASE_PATH + 'contents.css';
            var editor = CKEDITOR.replace($(this.input).attr('id'), this.getEditorSettings());
            editor.on('change', function (evt) { return evt.editor.updateElement(); });
            editor.on("instanceReady", function (event) { return Modal_1.default.adjustHeight(); });
        };
        HtmlEditor.prototype.getEditorSettings = function () {
            return {
                toolbar: $(this.input).attr('data-toolbar') || Config_1.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: '/Scripts/ckeditor_config.js'
            };
        };
        return HtmlEditor;
    }());
    exports.default = HtmlEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSHRtbEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9QbHVnaW5zL0h0bWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQU1JLG9CQUFZLFdBQWdCO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1FBQzdCLENBQUM7UUFKYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQTdCLENBQTZCLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFNakcsMkJBQU0sR0FBTjtZQUNJLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxhQUFhLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELDBDQUFxQixHQUFyQjtZQUNJLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBRUQsK0NBQTBCLEdBQTFCO1lBQ0ksUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUM7WUFFMUUsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRWxGLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsZUFBSyxDQUFDLFlBQVksRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUVELHNDQUFpQixHQUFqQjtZQUNJLE1BQU0sQ0FBQztnQkFDSCxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksZ0JBQU0sQ0FBQyx3QkFBd0I7Z0JBQzlFLFlBQVksRUFBRSw2QkFBNkI7YUFDOUMsQ0FBQztRQUNOLENBQUM7UUFDTCxpQkFBQztJQUFELENBQUMsQUFqQ0QsSUFpQ0MifQ==