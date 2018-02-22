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
    hasExistingFile(): boolean;
    showExistingFile(): void;
    removeExistingFile(): void;
    onDeleteButtonClicked(): void;
    onDragDropped(e: any, data: any): void;
    onProgressAll(e: any, data: any): void;
    onUploadError(response: any): void;
    onUploadSuccess(response: any): void;
    onChange(e: any, data: any): void;
}
