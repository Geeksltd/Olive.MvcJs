export default class HtmlEditor {
    input: any;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    onCkEditorScriptReady(): void;
    onJQueryAdapterScriptReady(): void;
    getEditorSettings(): {
        toolbar: string;
        customConfig: string;
    };
}
