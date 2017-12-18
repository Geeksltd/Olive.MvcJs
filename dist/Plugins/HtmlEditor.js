define(["require", "exports", "olive/Config", "olive/Components/Modal"], function (require, exports, Config_1, Modal_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var HtmlEditor = /** @class */ (function () {
        function HtmlEditor(targetInput) {
            this.input = targetInput;
        }
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
//# sourceMappingURL=HtmlEditor.js.map