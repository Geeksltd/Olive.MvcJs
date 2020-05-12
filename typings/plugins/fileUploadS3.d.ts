import FileUpload, { FileUploadFactory } from "olive/plugins/fileUpload";
import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";
export declare class FileUploadS3Factory extends FileUploadFactory {
    protected bucketUrl: string;
    constructor(url: Url, serverInvoker: ServerInvoker, bucketUrl: string);
    enable(selector: JQuery): void;
}
export declare class FileUploadS3 extends FileUpload {
    protected bucketUrl: string;
    constructor(input: JQuery, url: Url, serverInvoker: ServerInvoker, bucketUrl: string);
    protected getDataUrlAttribute(): string;
    protected getFileuploadOptions(): any;
    private add;
    private uuidv4;
}
