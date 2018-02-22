export default class HtmlEditor {
    input: any;
    static enable(selector: JQuery): void;
    constructor(targetInput: any);
    enable(): void;
    onCkEditorScriptReady(): void;
    getEditorSettings(): {
        toolbar: any;
        customConfig: string;
    };
}
