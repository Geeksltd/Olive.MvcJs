import FormAction from "olive/mvc/formAction"
import Url from "olive/components/url"
import CrossDomainEvent from "olive/components/crossDomainEvent";

// For configuration see:
// http://markusslima.github.io/bootstrap-filestyle/ 
// https://blueimp.github.io/jQuery-File-Upload/

export class FileUploadFactory implements IService {

    constructor(private url: Url,
        private formAction: FormAction) { }

    public enable(selector: JQuery) { selector.each((i, e) => new FileUpload($(e), this.url, this.formAction).enable()); }
}

export default class FileUpload {
    input: JQuery;
    container: JQuery;
    idInput: JQuery;
    deleteButton: JQuery;
    progressBar: JQuery;
    currentFileLink: JQuery;
    existingFileNameInput: JQuery;
    fileLabel: JQuery;

    constructor(targetInput: JQuery, private url: Url, private formAction: FormAction) {
        this.input = targetInput;
        this.fixMasterDetailsInputName();
        this.input.before(this.input.siblings('input'));
        this.container = this.input.closest(".file-upload");
        this.idInput = this.container.find("input.file-id");
        this.fileLabel = this.input.parent().find(':text');
        this.deleteButton = this.container.find(".delete-file").click(e => this.onDeleteButtonClicked());
    }

    enable() {
        this.input.attr("data-url", this.url.effectiveUrlProvider("/upload", this.input));
        const options = {
            'input': this.input.attr('data-input') !== 'false',
            'htmlIcon': this.input.attr('data-icon'),
            'buttonBefore': this.input.attr('data-buttonBefore') ? this.input.attr('data-buttonBefore') !== 'false' : true,
            'disabled': this.input.attr('data-disabled') === 'true',
            'size': this.input.attr('data-size'),
            'text': this.input.attr('data-text'),
            'btnClass': this.input.attr('data-btnClass'),
            'badge': this.input.attr('data-badge') === 'true',
            'dragdrop': this.input.attr('data-dragdrop') !== 'false',
            'badgeName': this.input.attr('data-badgeName'),
            'placeholder': this.input.attr('data-placeholder')
        };
        this.input.filestyle(options);
        this.container.find('.bootstrap-filestyle > input:text').wrap($("<div class='progress'></div>"));
        this.progressBar = this.container.find(".progress-bar");
        this.container.find('.bootstrap-filestyle > .progress').prepend(this.progressBar);
        if (this.idInput.val() != "REMOVE") {
            this.currentFileLink = this.container.find('.current-file > a');
            this.existingFileNameInput = this.container.find('.bootstrap-filestyle > .progress > input:text');
        }

        if (this.hasExistingFile() && this.existingFileNameInput.val() == "")
            this.showExistingFile();

        this.input.fileupload({
            dataType: 'json',
            dropZone: this.container.find('*'),
            replaceFileInput: false,
            drop: this.onDragDropped.bind(this),
            change: this.onChange.bind(this),
            progressall: this.onProgressAll.bind(this),
            error: this.onUploadError,
            success: this.onUploadSuccess.bind(this),
            xhrFields: { withCredentials: true },
            complete: this.onUploadCompleted.bind(this)
        });
    }

    fixMasterDetailsInputName(): void {
        let nameParts = this.input.attr('name').split('.');
        this.input.attr('name', nameParts[nameParts.length - 1]);
    }

    hasExistingFile(): boolean {
        if (!this.currentFileLink) return false;
        let name = this.currentFileLink.text();
        if (!name) return false;
        if (name === "«UNCHANGED»") return false;
        if (name === "NoFile.Empty") return false;
        return true;
    }

    showExistingFile() {
        this.deleteButton.show();
        this.progressBar.width('100%');

        this.existingFileNameInput
            .val(this.currentFileLink.text())
            .removeAttr('disabled')
            .addClass('file-target')
            .attr('readonly', 'readonly')
            .click(() => this.currentFileLink[0].click());
    }

    removeExistingFile() {
        if (!this.hasExistingFile()) return;
        this.existingFileNameInput.removeClass('file-target').attr('disabled', 'true').off();
    }

    onDeleteButtonClicked() {
        this.deleteButton.hide();
        if (!this.idInput.data('val-required'))
            this.idInput.val("REMOVE");
        else
            this.idInput.val('');
        this.progressBar.width(0);
        this.input.filestyle('clear');
        this.removeExistingFile();
    }

    onDragDropped(e, data) {
        if (this.fileLabel.length > 0 && data.files.length > 0) {
            this.fileLabel.val(data.files.map(x => x.name));
        }
    }

    onProgressAll(e, data: any) {
        let progress = parseInt((data.loaded / data.total * 100).toString(), 10);
        this.progressBar.width(progress + '%');
    }

    onUploadError(jqXHR: JQueryXHR, status: string, error: string) {
        this.formAction.onAjaxResponseError(jqXHR, status, error);
        this.fileLabel.val('');
    }

    onUploadSuccess(response) {
        if (response.Error) {
            this.formAction.onAjaxResponseError(<any>{ responseText: response.Error }, "error", response.Error);
            this.fileLabel.val('');
        }
        else {
            if (this.input.is("[multiple]")) this.idInput.val(this.idInput.val() + "|file:" + response.Result.ID);
            else this.idInput.val("file:" + response.Result.ID);
            this.deleteButton.show();
        }
    }

    onUploadCompleted(response) {
        CrossDomainEvent.raise(parent, "file-uploaded", response);
    }

    onChange(e, data) {
        this.progressBar.width(0);
        this.removeExistingFile();
    }
}