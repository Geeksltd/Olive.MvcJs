import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";

export class HtmlEditorFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new HtmlEditor($(e), this.modalHelper).enable()); }
}

export default class HtmlEditor {
    public static editorConfigPath: string = "/scripts/ckeditor_config.js";

    constructor(private input: JQuery, private modalHelper: ModalHelper) { }

    public enable() {
        if (this.input.css("display") === "none") return;

        window["CKEDITOR_BASEPATH"] = Config.CK_EDITOR_BASE_PATH;
        this.onDemandScript(Config.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCkEditorScriptReady());
    }

    protected onCkEditorScriptReady() {
        CKEDITOR.basePath = Config.CK_EDITOR_BASE_PATH;

        CKEDITOR.config.contentsCss = Config.CK_EDITOR_BASE_PATH + 'contents.css';

        let editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());

        editor.on('change', (evt) => evt.editor.updateElement());
        editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
    }

    protected getEditorSettings() {
        return {
            toolbar: this.input.attr('data-toolbar') || Config.DEFAULT_HTML_EDITOR_MODE,
            customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
        };
    }

    protected onDemandScript(url, callback) {
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
