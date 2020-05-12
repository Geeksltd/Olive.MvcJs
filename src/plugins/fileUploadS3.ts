import FileUpload, { FileUploadFactory } from "olive/plugins/fileUpload";
import Url from "olive/components/url";
import ServerInvoker from "olive/mvc/serverInvoker";

export class FileUploadS3Factory extends FileUploadFactory {
    constructor(
        url: Url,
        serverInvoker: ServerInvoker,
        protected bucketUrl: string,
    ) {
        super(url, serverInvoker);
    }

    public enable(selector: JQuery) {
        selector.each((i, e) => new FileUploadS3($(e), this.url, this.serverInvoker, this.bucketUrl).enable());
    }
}

export class FileUploadS3 extends FileUpload {
    constructor(
        input: JQuery,
        url: Url,
        serverInvoker: ServerInvoker,
        protected bucketUrl: string,
    ) {
        super(input, url, serverInvoker);
    }

    protected getDataUrlAttribute(): string {
        return undefined;
    }

    protected getFileuploadOptions() {
        return $.extend(
            {
                add: this.add,
            },
            super.getFileuploadOptions());
    }

    private add = (e: JQueryEventObject) => {
        const file = (e.target as HTMLInputElement).files[0];
        const id = this.uuidv4();
        const key = `${id}/${file.name}`;

        const data = new FormData();

        data.append("key", key);
        data.append("acl", "public-read");
        data.append("file", file, file.name);

        $.ajax({
            url: this.bucketUrl,
            type: "POST",
            processData: false,
            contentType: false,
            data,
            success: () => {
                if (this.input.is("[multiple]")) {
                    this.tempFileIdInput.val(this.tempFileIdInput.val() + "|" + id);
                    this.filenameInput.val(this.filenameInput.val() + ", " + file.name);
                } else {
                    this.tempFileIdInput.val(id);
                    this.filenameInput.val(file.name);
                }
                this.deleteButton.show();
                this.setValidationValue("value");
            },
            error: (jqXhr, _, message) => {
                this.serverInvoker.onAjaxResponseError(jqXhr, "error", message);
                this.filenameInput.val("");
            },
            xhr: () => {
                const xhr = new window.XMLHttpRequest();
                xhr.upload.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable) {
                        this.onProgressAll(undefined, evt);
                    }
                }, false);

                return xhr;
            },
        });
    }

    private uuidv4 = () => {
        return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
