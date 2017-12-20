import FormAction from "olive/Mvc/FormAction"

export default class FileUpload {
    input: any;
    constructor(targetInput: any) {
        this.input = targetInput;
    }

    public enable() {

        let control = this.input;
        let container: JQuery = this.input.closest(".file-upload");
        let del = container.find(".delete-file");
        let idInput = container.find("input.file-id");
        let progressBar = container.find(".progress-bar");
        control.attr("data-url", "/file/upload");
        // Config http://markusslima.github.io/bootstrap-filestyle/ & https://blueimp.github.io/jQuery-File-Upload/
        control.filestyle({ buttonBefore: true });
        container.find('.bootstrap-filestyle > input:text').wrap($("<div class='progress'></div>"));
        container.find('.bootstrap-filestyle > .progress').prepend(progressBar);

        let currentFile = null;
        let inputControl = null;

        if (idInput.val() != "REMOVE") {
            currentFile = container.find('.current-file > a');
            inputControl = container.find('.bootstrap-filestyle > .progress > input:text');
        }

        let currentFileName = currentFile ? currentFile.text() : null;
        let hasExistingFile = currentFileName != "«UNCHANGED»" && (currentFileName != "NoFile.Empty" && currentFileName);

        if (hasExistingFile && inputControl.val() == "") {
            del.show();
            progressBar.width('100%');
            // enable Existing File Download
            inputControl.val(currentFile.text()).removeAttr('disabled').addClass('file-target').click(() => currentFile[0].click());
        }

        let handleCurrentFileChange = () => {
            if (hasExistingFile) {
                inputControl.removeClass('file-target').attr('disabled', 'true').off();
                hasExistingFile = false;
            }
        };

        del.click((e) => {
            del.hide();
            idInput.val("REMOVE");
            progressBar.width(0);
            control.filestyle('clear');
            handleCurrentFileChange();
        });

        let fileLabel = control.parent().find(':text');
        this.input.fileupload({
            dataType: 'json',
            dropZone: container,
            replaceFileInput: false,
            drop: (e, data) => {

                if (fileLabel.length > 0 && data.files.length > 0) {
                    fileLabel.val(data.files.map(x => x.name));
                }
            },
            change: (e, data) => { progressBar.width(0); handleCurrentFileChange(); },
            progressall: (e, data: any) => {
                let progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                progressBar.width(progress + '%');
            },
            error: (response) => { FormAction.onAjaxResponseError(response); fileLabel.val(''); },
            success: (response) => {
                if (response.Error) {
                    FormAction.onAjaxResponseError({ responseText: response.Error });
                    fileLabel.val('');
                }
                else {
                    if (this.input.is("[multiple]")) idInput.val(idInput.val() + "|file:" + response.Result.ID);
                    else idInput.val("file:" + response.Result.ID);
                    del.show();
                }
            }
        });
    }
}
