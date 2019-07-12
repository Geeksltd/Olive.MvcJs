import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";
export declare class FileUploadFactory implements IService {
    private url;
    private serverInvoker;
    constructor(url: Url, serverInvoker: ServerInvoker);
    enable(selector: JQuery): void;
}
export default class FileUpload {
    private input;
    private url;
    private serverInvoker;
    private container;
    private idInput;
    private deleteButton;
    private progressBar;
    private currentFileLink;
    private existingFileNameInput;
    private fileLabel;
    constructor(input: JQuery, url: Url, serverInvoker: ServerInvoker);
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
