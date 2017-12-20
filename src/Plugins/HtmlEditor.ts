import Config from "olive/Config"
import Modal from "olive/Components/Modal"

export default class HtmlEditor {

    input: any;
    
    public static enable(selector:JQuery){selector.each((i,e)=> new HtmlEditor($(e)).enable())}

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable( ) {
        $.getScript(Config.CK_EDITOR_BASE_PATH + "ckeditor.js", this.onCkEditorScriptReady);
    }

    onCkEditorScriptReady() {
        $.getScript(Config.CK_EDITOR_BASE_PATH + "adapters/jquery.js", this.onJQueryAdapterScriptReady);
    }

    onJQueryAdapterScriptReady() {
        CKEDITOR.config.contentsCss = Config.CK_EDITOR_BASE_PATH + 'contents.css';

        let editor = CKEDITOR.replace($(this.input).attr('id'), this.getEditorSettings());

        editor.on('change', (evt) => evt.editor.updateElement());
        editor.on("instanceReady", (event) => Modal.adjustHeight());
    }

    getEditorSettings() {
        return {
            toolbar: $(this.input).attr('data-toolbar') || Config.DEFAULT_HTML_EDITOR_MODE,
            customConfig: '/Scripts/ckeditor_config.js'
        };
    }
}
