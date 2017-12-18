define(["require", "exports", "olive/Components/MvcAction"], function (require, exports, MvcAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var FileUpload = /** @class */ (function () {
        function FileUpload(targetInput) {
            this.input = targetInput;
        }
        FileUpload.prototype.enable = function () {
            var _this = this;
            var control = this.input;
            var container = this.input.closest(".file-upload");
            var del = container.find(".delete-file");
            var idInput = container.find("input.file-id");
            var progressBar = container.find(".progress-bar");
            control.attr("data-url", "/file/upload");
            // Config http://markusslima.github.io/bootstrap-filestyle/ & https://blueimp.github.io/jQuery-File-Upload/
            control.filestyle({ buttonBefore: true });
            container.find('.bootstrap-filestyle > input:text').wrap($("<div class='progress'></div>"));
            container.find('.bootstrap-filestyle > .progress').prepend(progressBar);
            if (idInput.val() != "REMOVE") {
                var currentFile = container.find('.current-file > a');
                var inputControl = container.find('.bootstrap-filestyle > .progress > input:text');
            }
            var currentFileName = currentFile ? currentFile.text() : null;
            var hasExistingFile = currentFileName != "«UNCHANGED»" && (currentFileName != "NoFile.Empty" && currentFileName != null);
            if (hasExistingFile && inputControl.val() == "") {
                del.show();
                progressBar.width('100%');
                // enable Existing File Download
                inputControl.val(currentFile.text()).removeAttr('disabled').addClass('file-target').click(function () { return currentFile[0].click(); });
            }
            var handleCurrentFileChange = function () {
                if (hasExistingFile) {
                    inputControl.removeClass('file-target').attr('disabled', 'true').off();
                    hasExistingFile = false;
                }
            };
            del.click(function (e) {
                del.hide();
                idInput.val("REMOVE");
                progressBar.width(0);
                control.filestyle('clear');
                handleCurrentFileChange();
            });
            var fileLabel = control.parent().find(':text');
            this.input.fileupload({
                dataType: 'json',
                dropZone: container,
                replaceFileInput: false,
                drop: function (e, data) {
                    if (fileLabel.length > 0 && data.files.length > 0) {
                        fileLabel.val(data.files.map(function (x) { return x.name; }));
                    }
                },
                change: function (e, data) { progressBar.width(0); handleCurrentFileChange(); },
                progressall: function (e, data) {
                    var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
                    progressBar.width(progress + '%');
                },
                error: function (response) { MvcAction_1.default.onAjaxResponseError(response); fileLabel.val(''); },
                success: function (response) {
                    if (response.Error) {
                        MvcAction_1.default.onAjaxResponseError({ responseText: response.Error });
                        fileLabel.val('');
                    }
                    else {
                        if (_this.input.is("[multiple]"))
                            idInput.val(idInput.val() + "|file:" + response.Result.ID);
                        else
                            idInput.val("file:" + response.Result.ID);
                        del.show();
                    }
                }
            });
        };
        return FileUpload;
    }());
    exports.default = FileUpload;
});
//# sourceMappingURL=FileUpload.js.map