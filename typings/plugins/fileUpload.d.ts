import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";
import "file-style";
export declare class FileUploadFactory implements IService {
    protected url: Url;
    protected serverInvoker: ServerInvoker;
    constructor(url: Url, serverInvoker: ServerInvoker);
    enable(selector: JQuery): void;
}
export default class FileUpload {
    protected input: JQuery;
    protected url: Url;
    protected serverInvoker: ServerInvoker;
    protected container: JQuery;
    protected deleteButton: JQuery;
    protected progressBar: JQuery;
    protected currentFileLink: JQuery;
    protected existingFileNameInput: JQuery;
    protected actionInput: JQuery;
    protected tempFileIdInput: JQuery;
    protected filenameInput: JQuery;
    protected validationInput: JQuery;
    constructor(input: JQuery, url: Url, serverInvoker: ServerInvoker);
    enable(): void;
    protected getDataUrlAttribute(): string;
    protected getFilestyleOptions(): any;
    protected getFileuploadOptions(): any;
    private fixMasterDetailsInputName;
    private hasExistingFile;
    private showExistingFile;
    private removeExistingFile;
    private onDeleteButtonClicked;
    private onDragDropped;
    protected onProgressAll(e: any, data: any): void;
    private onUploadError;
    private onUploadSuccess;
    protected onUploadCompleted(response: any): void;
    protected UploadCompleted(args: IFileUploadedEventArgs): void;
    private onChange;
    protected setValidationValue(value: string): void;
}
export declare class FileUploadS3 extends FileUpload {
    protected bucketUrl: string;
    constructor(input: JQuery, url: Url, serverInvoker: ServerInvoker, bucketUrl: string);
    protected getDataUrlAttribute(): string;
    protected getFileuploadOptions(): any;
    private add;
    protected onUploadCompleted({ id, filename }: {
        id: any;
        filename: any;
    }): void;
    private uuidv4;
}
export interface IFileUploadedEventArgs {
    id: string;
    filename: string;
    url: string;
}
