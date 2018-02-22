define(["require", "exports", "olive/mvc/formAction"], function (require, exports, formAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // For configuration see:
    // http://markusslima.github.io/bootstrap-filestyle/ 
    // https://blueimp.github.io/jQuery-File-Upload/
    var FileUpload = /** @class */ (function () {
        function FileUpload(targetInput) {
            var _this = this;
            this.input = targetInput;
            this.container = this.input.closest(".file-upload");
            this.idInput = this.container.find("input.file-id");
            this.fileLabel = this.input.parent().find(':text');
            this.deleteButton = this.container.find(".delete-file").click(function (e) { return _this.onDeleteButtonClicked(); });
        }
        FileUpload.enable = function (selector) { selector.each(function (i, e) { return new FileUpload($(e)).enable(); }); };
        FileUpload.prototype.enable = function () {
            this.input.attr("data-url", "/upload");
            this.input.filestyle({ buttonBefore: true });
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
                dropZone: this.container,
                replaceFileInput: false,
                drop: this.onDragDropped.bind(this),
                change: this.onChange.bind(this),
                progressall: this.onProgressAll.bind(this),
                error: this.onUploadError.bind(this),
                success: this.onUploadSuccess.bind(this)
            });
        };
        FileUpload.prototype.hasExistingFile = function () {
            if (!this.currentFileLink)
                return false;
            var name = this.currentFileLink.text();
            if (!name)
                return false;
            if (name === "«UNCHANGED»")
                return false;
            if (name === "NoFile.Empty")
                return false;
            return true;
        };
        FileUpload.prototype.showExistingFile = function () {
            var _this = this;
            this.deleteButton.show();
            this.progressBar.width('100%');
            this.existingFileNameInput
                .val(this.currentFileLink.text())
                .removeAttr('disabled')
                .addClass('file-target')
                .click(function () { return _this.currentFileLink[0].click(); });
        };
        FileUpload.prototype.removeExistingFile = function () {
            if (!this.hasExistingFile())
                return;
            this.existingFileNameInput.removeClass('file-target').attr('disabled', 'true').off();
        };
        FileUpload.prototype.onDeleteButtonClicked = function () {
            this.deleteButton.hide();
            this.idInput.val("REMOVE");
            this.progressBar.width(0);
            this.input.filestyle('clear');
            this.removeExistingFile();
        };
        FileUpload.prototype.onDragDropped = function (e, data) {
            if (this.fileLabel.length > 0 && data.files.length > 0) {
                this.fileLabel.val(data.files.map(function (x) { return x.name; }));
            }
        };
        FileUpload.prototype.onProgressAll = function (e, data) {
            var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
            this.progressBar.width(progress + '%');
        };
        FileUpload.prototype.onUploadError = function (response) {
            formAction_1.default.onAjaxResponseError(response);
            this.fileLabel.val('');
        };
        FileUpload.prototype.onUploadSuccess = function (response) {
            if (response.Error) {
                formAction_1.default.onAjaxResponseError({ responseText: response.Error });
                this.fileLabel.val('');
            }
            else {
                if (this.input.is("[multiple]"))
                    this.idInput.val(this.idInput.val() + "|file:" + response.Result.ID);
                else
                    this.idInput.val("file:" + response.Result.ID);
                this.deleteButton.show();
            }
        };
        FileUpload.prototype.onChange = function (e, data) {
            this.progressBar.width(0);
            this.removeExistingFile();
        };
        return FileUpload;
    }());
    exports.default = FileUpload;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2ZpbGVVcGxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFFQSx5QkFBeUI7SUFDekIscURBQXFEO0lBQ3JELGdEQUFnRDtJQUVoRDtRQVlJLG9CQUFZLFdBQW1CO1lBQS9CLGlCQU1DO1lBTEcsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFSYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQTdCLENBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFVbEcsMkJBQU0sR0FBTjtZQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxF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