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

        // Support both CKEditor 4 and 5
        if (this.isCKEditor5()) {
            this.enableCKEditor5();
        } else {
            this.enableCKEditor4();
        }
    }

    protected isCKEditor5(): boolean {
        // Check if CKEditor 5 is available
        return typeof window["ClassicEditor"] !== "undefined" || 
               typeof window["DecoupledEditor"] !== "undefined" ||
               typeof window["InlineEditor"] !== "undefined";
    }

    protected enableCKEditor5() {
        // Load CKEditor 5 dynamically
        this.onDemandScript(Config.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCKEditor5ScriptReady());
    }

    protected enableCKEditor4() {
        // Legacy CKEditor 4 support
        window["CKEDITOR_BASEPATH"] = Config.CK_EDITOR_BASE_PATH;
        this.onDemandScript(Config.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCKEditor4ScriptReady());
    }

    protected onCKEditor5ScriptReady() {
        const EditorClass = window["ClassicEditor"] || window["DecoupledEditor"] || window["InlineEditor"];
        
        if (!EditorClass) {
            console.error("CKEditor 5 not found. Falling back to CKEditor 4.");
            this.enableCKEditor4();
            return;
        }

        const element = this.input[0];
        const config = this.getCKEditor5Settings();

        EditorClass.create(element, config)
            .then(editor => {
                this.setupCKEditor5Events(editor);
                this.modalHelper.adjustHeight();
            })
            .catch(error => {
                console.error("Error initializing CKEditor 5:", error);
                // Fallback to CKEditor 4
                this.enableCKEditor4();
            });
    }

    protected onCKEditor4ScriptReady() {
        CKEDITOR.basePath = Config.CK_EDITOR_BASE_PATH;
        CKEDITOR.config.contentsCss = Config.CK_EDITOR_BASE_PATH + 'contents.css';

        let editor = CKEDITOR.replace(this.input.attr('name'), this.getCKEditor4Settings());

        editor.on('change', (evt) => evt.editor.updateElement());
        editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
    }

    protected setupCKEditor5Events(editor: any) {
        editor.model.document.on('change:data', () => {
            // Update the original input element
            this.input.val(editor.getData());
        });
    }

    protected getCKEditor5Settings() {
        const toolbar = this.input.attr('data-toolbar') || Config.DEFAULT_HTML_EDITOR_MODE;
        
        return {
            toolbar: this.getCKEditor5Toolbar(toolbar),
            // Add other CKEditor 5 specific configurations
            placeholder: this.input.attr('placeholder') || 'Enter your content...',
            // Plugin configurations can be added here
        };
    }

    protected getCKEditor4Settings() {
        return {
            toolbar: this.input.attr('data-toolbar') || Config.DEFAULT_HTML_EDITOR_MODE,
            customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
        };
    }

    protected getCKEditor5Toolbar(toolbarMode: string) {
        // Map toolbar modes to CKEditor 5 toolbar configurations
        const toolbarConfigs = {
            'Compact': ['bold', 'italic', 'link'],
            'Medium': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'],
            'Advance': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'imageUpload', 'mediaEmbed', '|', 'undo', 'redo'],
            'Full': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'imageUpload', 'mediaEmbed', '|', 'codeBlock', '|', 'undo', 'redo']
        };

        return toolbarConfigs[toolbarMode] || toolbarConfigs['Medium'];
    }

    protected onDemandScript(url: string, callback: () => void) {
        callback = (typeof callback !== "undefined") ? callback : () => {};

        $.ajax({
            type: "GET",
            url: url,
            success: callback,
            dataType: "script",
            cache: true
        });
    }
}
