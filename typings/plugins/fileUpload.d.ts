export default class FileUpload {
    input: JQuery;
    container: JQuery;
    idInput: JQuery;
    deleteButton: JQuery;
    progressBar: JQuery;
    currentFileLink: JQuery;
    existingFileNameInput: JQuery;
    fileLabel: JQuery;
    static enable(selector: JQuery): void;
    constructor(targetInput: JQuery);
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
