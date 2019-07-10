import FormAction from "olive/mvc/formAction";
import Url from "olive/components/url";
export declare class FileUploadFactory implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: FormAction);
    enable(selector: JQuery): void;
}
export default class FileUpload {
    private url;
    private formAction;
    input: JQuery;
    container: JQuery;
    idInput: JQuery;
    deleteButton: JQuery;
    progressBar: JQuery;
    currentFileLink: JQuery;
    existingFileNameInput: JQuery;
    fileLabel: JQuery;
    constructor(targetInput: JQuery, url: Url, formAction: FormAction);
    enable(): void;
    fixMasterDetailsInputName(): void;
    hasExistingFile(): boolean;
    showExistingFile(): void;
    removeExistingFile(): void;
    onDeleteButtonClicked(): void;
    onDragDropped(e: any, data: any): void;
    onProgressAll(e: any, data: any): void;
    onUploadError(jqXHR: JQueryXHR, status: string, error: string): void;
    onUploadSuccess(response: any): void;
    onUploadCompleted(response: any): void;
    onChange(e: any, data: any): void;
}
