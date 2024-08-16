define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HtmlEditorFactory = void 0;
    class HtmlEditorFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new HtmlEditor($(e), this.modalHelper).enable()); }
    }
    exports.HtmlEditorFactory = HtmlEditorFactory;
    class HtmlEditor {
        constructor(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        enable() {
            if (this.input.css("display") === "none")
                return;
            window["CKEDITOR_BASEPATH"] = config_1.default.CK_EDITOR_BASE_PATH;
            this.onDemandScript(config_1.default.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCkEditorScriptReady());
        }
        onCkEditorScriptReady() {
            CKEDITOR.basePath = config_1.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_1.default.CK_EDITOR_BASE_PATH + 'contents.css';
            let editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());
            editor.on('change', (evt) => evt.editor.updateElement());
            editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
        }
        getEditorSettings() {
            return {
                toolbar: this.input.attr('data-toolbar') || config_1.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
            };
        }
        onDemandScript(url, callback) {
            callback = (typeof callback !== "undefined") ? callback : {};
            $.ajax({
                type: "GET",
                url: url,
                success: callback,
                dataType: "script",
                cache: true
            });
        }
    }
    exports.default = HtmlEditor;
    HtmlEditor.editorConfigPath = "/scripts/ckeditor_config.js";
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2h0bWxFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQUdBLE1BQWEsaUJBQWlCO1FBQzFCLFlBQW9CLFdBQXdCO1lBQXhCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQUksQ0FBQztRQUUxQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNoSDtJQUpELDhDQUlDO0lBRUQsTUFBcUIsVUFBVTtRQUczQixZQUFvQixLQUFhLEVBQVUsV0FBd0I7WUFBL0MsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQUksQ0FBQztRQUVqRSxNQUFNO1lBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNO2dCQUFFLE9BQU87WUFFakQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsQ0FBQztZQUN6RCxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFNLENBQUMsbUJBQW1CLEdBQUcsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUM7UUFDeEcsQ0FBQztRQUVTLHFCQUFxQjtZQUMzQixRQUFRLENBQUMsUUFBUSxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7WUFFL0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxjQUFjLENBQUM7WUFFMUUsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBRWpGLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDekQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBRVMsaUJBQWlCO1lBQ3ZCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsd0JBQXdCO2dCQUMzRSxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksVUFBVSxDQUFDLGdCQUFnQjthQUM5RSxDQUFDO1FBQ04sQ0FBQztRQUVTLGNBQWMsQ0FBQyxHQUFHLEVBQUUsUUFBUTtZQUNsQyxRQUFRLEdBQUcsQ0FBQyxPQUFPLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFFN0QsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDSCxJQUFJLEVBQUUsS0FBSztnQkFDWCxHQUFHLEVBQUUsR0FBRztnQkFDUixPQUFPLEVBQUUsUUFBUTtnQkFDakIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLEtBQUssRUFBRSxJQUFJO2FBQ2QsQ0FBQyxDQUFDO1FBQ1AsQ0FBQzs7SUF4Q0wsNkJBeUNDO0lBeENpQiwyQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQyJ9