define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var HtmlEditorFactory = /** @class */ (function () {
        function HtmlEditorFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        HtmlEditorFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new HtmlEditor($(e), _this.modalHelper).enable(); });
        };
        return HtmlEditorFactory;
    }());
    exports.HtmlEditorFactory = HtmlEditorFactory;
    var HtmlEditor = /** @class */ (function () {
        function HtmlEditor(targetInput, modalHelper) {
            this.modalHelper = modalHelper;
            this.input = targetInput;
        }
        HtmlEditor.prototype.enable = function () {
            var _this = this;
            window["CKEDITOR_BASEPATH"] = config_1.default.CK_EDITOR_BASE_PATH;
            this.onDemandScript(config_1.default.CK_EDITOR_BASE_PATH + "ckeditor.js", function () { return _this.onCkEditorScriptReady(); });
        };
        HtmlEditor.prototype.onCkEditorScriptReady = function () {
            var _this = this;
            CKEDITOR.basePath = config_1.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_1.default.CK_EDITOR_BASE_PATH + 'contents.css';
            var editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());
            editor.on('change', function (evt) { return evt.editor.updateElement(); });
            editor.on("instanceReady", function (event) { return _this.modalHelper.adjustHeight(); });
        };
        HtmlEditor.prototype.getEditorSettings = function () {
            return {
                toolbar: this.input.attr('data-toolbar') || config_1.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: HtmlEditor.editorConfigPath
            };
        };
        HtmlEditor.prototype.onDemandScript = function (url, callback) {
            callback = (typeof callback !== "undefined") ? callback : {};
            $.ajax({
                type: "GET",
                url: url,
                success: callback,
                dataType: "script",
                cache: true
            });
        };
        HtmlEditor.editorConfigPath = "/scripts/ckeditor_config.js";
        return HtmlEditor;
    }());
    exports.default = HtmlEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2h0bWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQUNJLDJCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsa0NBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUE2RztZQUEzRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9DLENBQStDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDakgsd0JBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLDhDQUFpQjtJQU05QjtRQU1JLG9CQUFZLFdBQWdCLEVBQVUsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUVELDJCQUFNLEdBQU47WUFBQSxpQkFHQztZQUZHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7WUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG1CQUFtQixHQUFHLGFBQWEsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLHFCQUFxQixFQUFFLEVBQTVCLENBQTRCLENBQUMsQ0FBQztRQUN4RyxDQUFDO1FBRUQsMENBQXFCLEdBQXJCO1lBQUEsaUJBU0M7WUFSRyxRQUFRLENBQUMsUUFBUSxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7WUFFL0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUM7WUFFMUUsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQUMsR0FBRyxJQUFLLE9BQUEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCxzQ0FBaUIsR0FBakI7WUFDSSxPQUFPO2dCQUNILE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxnQkFBTSxDQUFDLHdCQUF3QjtnQkFDM0UsWUFBWSxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0I7YUFDNUMsQ0FBQztRQUNOLENBQUM7UUFFTyxtQ0FBYyxHQUF0QixVQUF1QixHQUFHLEVBQUUsUUFBUTtZQUNoQyxRQUFRLEdBQUcsQ0FBQyxPQUFPLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFN0QsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDSCxJQUFJLEVBQUUsS0FBSztnQkFDWCxHQUFHLEVBQUUsR0FBRztnQkFDUixPQUFPLEVBQUUsUUFBUTtnQkFDakIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLEtBQUssRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQXZDYSwyQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQztRQXdDM0UsaUJBQUM7S0FBQSxBQTVDRCxJQTRDQztzQkE1Q29CLFVBQVUifQ==