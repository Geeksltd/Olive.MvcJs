export default class HtmlEditor {
    input: any;
    constructor(targetInput: any);
    enable(): void;
    onCkEditorScriptReady(): void;
    onJQueryAdapterScriptReady(): void;
    getEditorSettings(): {
        toolbar: string;
        customConfig: string;
    };
}
