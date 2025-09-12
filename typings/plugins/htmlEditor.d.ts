import { ModalHelper } from "olive/components/modal";
export declare class HtmlEditorFactory implements IService {
    private modalHelper;
    constructor(modalHelper: ModalHelper);
    enable(selector: JQuery): void;
}
export default class HtmlEditor {
    private input;
    private modalHelper;
    static editorConfigPath: string;
    constructor(input: JQuery, modalHelper: ModalHelper);
    enable(): void;
    protected isCKEditor5(): boolean;
    protected enableCKEditor5(): void;
    protected enableCKEditor4(): void;
    protected loadCKEditor5ViaRequireJS(): void;
    protected onCKEditor5ScriptReady(): void;
    protected initializeCKEditor5(EditorClass: any): void;
    protected onCKEditor4ScriptReady(): void;
    protected setupCKEditor5Events(editor: any): void;
    protected getCKEditor5Settings(): {
        toolbar: any;
        placeholder: string;
        licenseKey: string;
    };
    protected getCKEditor4Settings(): {
        toolbar: string;
        customConfig: string;
    };
    protected getCKEditor5Toolbar(toolbarMode: string): any;
    protected onDemandScript(url: string, callback: () => void): void;
}
