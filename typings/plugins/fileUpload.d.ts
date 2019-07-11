import FormAction from "olive/mvc/formAction";
import Url from "olive/components/url";
export declare class FileUploadFactory implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: FormAction);
    enable(selector: JQuery): void;
}
export default class FileUpload {
    private input;
    private url;
    private formAction;
    private container;
    private idInput;
    private deleteButton;
    private progressBar;
    private currentFileLink;
    private existingFileNameInput;
    private fileLabel;
    constructor(input: JQuery, url: Url, formAction: FormAction);
    enable(): void;
    private fixMasterDetailsInputName;
    private hasExistingFile;
    private showExistingFile;
    private removeExistingFile;
    private onDeleteButtonClicked;
    private onDragDropped;
    private onProgressAll;
    private onUploadError;
    private onUploadSuccess;
    private onUploadCompleted;
    private onChange;
}
