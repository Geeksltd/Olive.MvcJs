import { ModalHelper } from "olive/components/modal";
export declare class HtmlEditorFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class HtmlEditor {
    private modalHelper;
    input: any;
    static editorConfigPath: string;
    constructor(targetInput: any, modalHelper: ModalHelper);
    enable(): void;
    onCkEditorScriptReady(): void;
    getEditorSettings(): {
        toolbar: any;
        customConfig: string;
    };
    private onDemandScript;
}
