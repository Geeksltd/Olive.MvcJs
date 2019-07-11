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
    private onCkEditorScriptReady;
    private getEditorSettings;
    private onDemandScript;
}
