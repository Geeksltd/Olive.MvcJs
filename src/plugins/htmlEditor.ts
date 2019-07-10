import Config from "olive/config";
import { ModalHelper } from "olive/components/modal";

export class HtmlEditorFactory implements IService {
    constructor(private modalHelper: ModalHelper) { }

    public enable(selector: JQuery) { selector.each((i, e) => new HtmlEditor($(e), this.modalHelper).enable()); }
}

export default class HtmlEditor {

    input: any;

    public static editorConfigPath: string = "/scripts/ckeditor_config.js";

    constructor(targetInput: any, private modalHelper: ModalHelper) {
        this.input = targetInput;
    }

    enable() {
        window["CKEDITOR_BASEPATH"] = Config.CK_EDITOR_BASE_PATH;
        this.onDemandScript(Config.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCkEditorScriptReady());
    }

    onCkEditorScriptReady() {
        CKEDITOR.basePath = Config.CK_EDITOR_BASE_PATH;

        CKEDITOR.config.contentsCss = Config.CK_EDITOR_BASE_PATH + 'contents.css';

        let editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());

        editor.on('change', (evt) => evt.editor.updateElement());
        editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
    }

    getEditorSettings() {
        return {
            toolbar: this.input.attr('data-toolbar') || Config.DEFAULT_HTML_EDITOR_MODE,
            customConfig: HtmlEditor.editorConfigPath
        };
    }

    private onDemandScript(url, callback) {
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
