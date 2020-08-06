// import FormAction from "olive/mvc/formAction"
import Url from "olive/components/url";
import CrossDomainEvent from "olive/components/crossDomainEvent";
import ServerInvoker from "olive/mvc/serverInvoker";
import "file-style";

// For configuration see:
// http://markusslima.github.io/bootstrap-filestyle/
// https://blueimp.github.io/jQuery-File-Upload/

export class FileUploadFactory implements IService {

    constructor(
        protected url: Url,
        protected serverInvoker: ServerInvoker,
    ) { }

    public enable(selector: JQuery) {
        selector.each((_, e) => {
            const input = $(e);
            const s3Url = input.data("s3-url");

            if (!s3Url) {
                new FileUpload(input, this.url, this.serverInvoker).enable();
            } else {
                new FileUploadS3(input, this.url, this.serverInvoker, s3Url).enable();
            }
        });
    }
}

export default class FileUpload {
    protected container: JQuery;
    protected deleteButton: JQuery;
    protected progressBar: JQuery;
    protected currentFileLink: JQuery;
    protected existingFileNameInput: JQuery;

    protected actionInput: JQuery;
    protected tempFileIdInput: JQuery;
    protected filenameInput: JQuery;
    protected validationInput: JQuery;

    constructor(protected input: JQuery, protected url: Url, protected serverInvoker: ServerInvoker) {
        this.fixMasterDetailsInputName();

        // console.log("Check me!!")
        // this.input.before(this.input.siblings('input'));

        this.container = this.input.closest(".file-upload");
        // this.idInput = this.container.find("input.file-id");
        // this.fileLabel = this.input.parent().find(':text');

        this.actionInput = this.container.find(".Action");
        this.tempFileIdInput = this.container.find(".TempFileId");
        this.filenameInput = this.container.find(".Filename");
        this.validationInput = this.container.find(".validation");

        this.deleteButton = this.container.find(".delete-file").click((e) => this.onDeleteButtonClicked());
    }

    public enable() {
        this.input.attr("data-url", this.getDataUrlAttribute());
        this.input.filestyle(this.getFilestyleOptions());

        this.container.find(".bootstrap-filestyle > input:text").wrap($("<div class='progress'></div>"));
        this.progressBar = this.container.find(".progress-bar");
        this.container.find(".bootstrap-filestyle > .progress").prepend(this.progressBar);
        if (this.actionInput.val() !== "Removed") {
            this.currentFileLink = this.container.find(".current-file > a");
            this.existingFileNameInput = this.container.find(".bootstrap-filestyle > .progress > input:text");
        }

        if (this.hasExistingFile() && this.existingFileNameInput.val() === "") {
            this.showExistingFile();
        }

        this.input.fileupload(this.getFileuploadOptions());
    }

    protected getDataUrlAttribute(): string {
        return this.url.effectiveUrlProvider("/upload", this.input);
    }

    protected getFilestyleOptions(): any {
        return {
            input: this.input.attr("data-input") !== "false",
            htmlIcon: this.input.attr("data-icon"),
            buttonBefore: this.input.attr("data-buttonBefore") ?
                this.input.attr("data-buttonBefore") !== "false" : true,
            disabled: this.input.attr("data-disabled") === "true",
            size: this.input.attr("data-size"),
            text: this.input.attr("data-text"),
            btnClass: this.input.attr("data-btnClass"),
            badge: this.input.attr("data-badge") === "true",
            dragdrop: this.input.attr("data-dragdrop") !== "false",
            badgeName: this.input.attr("data-badgeName"),
            placeholder: this.input.attr("data-placeholder"),
        };
    }

    protected getFileuploadOptions(): any {
        return {
            dataType: "json",
            dropZone: this.container.find("*"),
            replaceFileInput: false,
            drop: this.onDragDropped.bind(this),
            change: this.onChange.bind(this),
            progressall: this.onProgressAll.bind(this),
            error: this.onUploadError,
            success: this.onUploadSuccess.bind(this),
            xhrFields: { withCredentials: true },
            complete: this.onUploadCompleted.bind(this),
        };
    }

    private fixMasterDetailsInputName(): void {
        const nameParts = this.input.attr("name").split(".");
        this.input.attr("name", nameParts[nameParts.length - 1]);
    }

    private hasExistingFile(): boolean {
        if (!this.currentFileLink) { return false; }
        const name = this.currentFileLink.text();
        if (!name) { return false; }
        if (name === "«UNCHANGED»") { return false; }
        if (name === "NoFile.Empty") { return false; }
        return true;
    }

    private showExistingFile() {
        this.deleteButton.show();
        this.progressBar.width("100%");

        this.existingFileNameInput
            .val(this.currentFileLink.text())
            .removeAttr("disabled")
            .addClass("file-target")
            .attr("readonly", "readonly")
            .click(() => this.currentFileLink[0].click());

        this.setValidationValue("value");
    }

    private removeExistingFile() {
        if (!this.hasExistingFile()) { return; }
        this.existingFileNameInput.removeClass("file-target").attr("disabled", "true").off();
    }

    private onDeleteButtonClicked() {
        this.deleteButton.hide();
        this.actionInput.val("Removed");
        this.setValidationValue("");
        this.progressBar.width(0);
        this.input.filestyle("clear");
        this.removeExistingFile();
        this.tempFileIdInput.val("");
    }

    private onDragDropped(e, data) {
        if (this.filenameInput.length > 0 && data.files.length > 0) {
            this.filenameInput.val(data.files.map((x) => x.name));
        }
    }

    protected onProgressAll(e, data: any) {
        const progress = parseInt((data.loaded / data.total * 100).toString(), 10);
        this.progressBar.width(progress + "%");
    }

    private onUploadError = (jqXHR: JQueryXHR, status: string, error: string) => {
        this.serverInvoker.onAjaxResponseError(jqXHR, status, error);
        this.filenameInput.val("");
    }

    private onUploadSuccess(response) {
        if (response.Error) {
            this.serverInvoker.onAjaxResponseError({ responseText: response.Error } as any, "error", response.Error);
            this.filenameInput.val("");
        } else {
            if (this.input.is("[multiple]")) {
                this.tempFileIdInput.val(this.tempFileIdInput.val() + "|" + response.Result.ID);
                this.filenameInput.val(this.filenameInput.val() + ", " + response.Result.Name);
            } else {
                this.tempFileIdInput.val(response.Result.ID);
                this.filenameInput.val(response.Result.Name);
            }
            this.deleteButton.show();
            this.setValidationValue("value");
        }
    }

    protected onUploadCompleted(response) {
        const id = response.responseJSON.Result.ID;
        const filename = response.responseJSON.Result.Name;

        this.UploadCompleted({
            url: this.url.makeAbsolute(undefined, `/temp-file/${id}`),
            id,
            filename,
        });
    }

    protected UploadCompleted(args: IFileUploadedEventArgs) {
        CrossDomainEvent.raise(parent, "file-uploaded", args);
    }

    private onChange(e, data) {
        this.progressBar.width(0);
        this.removeExistingFile();
    }

    protected setValidationValue(value: string) {
        this.validationInput.val(value);
        this.input.closest("form").validate().element(this.validationInput);
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
                this.onUploadCompleted({
                    id,
                    filename: file.name,
                });
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

    protected onUploadCompleted({ id, filename }) {
        const url = `${this.bucketUrl}${id}/${filename}`;

        this.UploadCompleted({ id, filename, url });
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

export interface IFileUploadedEventArgs {
    id: string;
    filename: string;
    url: string;
}
