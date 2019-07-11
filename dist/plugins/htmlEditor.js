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
        function HtmlEditor(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2h0bWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQUNJLDJCQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsa0NBQU0sR0FBYixVQUFjLFFBQWdCO1lBQTlCLGlCQUE2RztZQUEzRSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQS9DLENBQStDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDakgsd0JBQUM7SUFBRCxDQUFDLEFBSkQsSUFJQztJQUpZLDhDQUFpQjtJQU05QjtRQUdJLG9CQUFvQixLQUFhLEVBQVUsV0FBd0I7WUFBL0MsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQUksQ0FBQztRQUVqRSwyQkFBTSxHQUFiO1lBQUEsaUJBR0M7WUFGRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBRyxnQkFBTSxDQUFDLG1CQUFtQixDQUFDO1lBQ3pELElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxhQUFhLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUE1QixDQUE0QixDQUFDLENBQUM7UUFDeEcsQ0FBQztRQUVPLDBDQUFxQixHQUE3QjtZQUFBLGlCQVNDO1lBUkcsUUFBUSxDQUFDLFFBQVEsR0FBRyxnQkFBTSxDQUFDLG1CQUFtQixDQUFDO1lBRS9DLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDO1lBRTFFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUVqRixNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFDLEdBQUcsSUFBSyxPQUFBLEdBQUcsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQTFCLENBQTBCLENBQUMsQ0FBQztZQUN6RCxNQUFNLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEVBQS9CLENBQStCLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRU8sc0NBQWlCLEdBQXpCO1lBQ0ksT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksZ0JBQU0sQ0FBQyx3QkFBd0I7Z0JBQzNFLFlBQVksRUFBRSxVQUFVLENBQUMsZ0JBQWdCO2FBQzVDLENBQUM7UUFDTixDQUFDO1FBRU8sbUNBQWMsR0FBdEIsVUFBdUIsR0FBRyxFQUFFLFFBQVE7WUFDaEMsUUFBUSxHQUFHLENBQUMsT0FBTyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBRTdELENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0gsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixLQUFLLEVBQUUsSUFBSTthQUNkLENBQUMsQ0FBQztRQUNQLENBQUM7UUFyQ2EsMkJBQWdCLEdBQVcsNkJBQTZCLENBQUM7UUFzQzNFLGlCQUFDO0tBQUEsQUF2Q0QsSUF1Q0M7c0JBdkNvQixVQUFVIn0=