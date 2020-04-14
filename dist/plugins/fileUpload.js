define(["require", "exports", "olive/components/crossDomainEvent", "file-style"], function (require, exports, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // For configuration see:
    // http://markusslima.github.io/bootstrap-filestyle/
    // https://blueimp.github.io/jQuery-File-Upload/
    var FileUploadFactory = /** @class */ (function () {
        function FileUploadFactory(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        FileUploadFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new FileUpload($(e), _this.url, _this.serverInvoker).enable(); });
        };
        return FileUploadFactory;
    }());
    exports.FileUploadFactory = FileUploadFactory;
    var FileUpload = /** @class */ (function () {
        function FileUpload(input, url, serverInvoker) {
            var _this = this;
            this.input = input;
            this.url = url;
            this.serverInvoker = serverInvoker;
            this.onUploadError = function (jqXHR, status, error) {
                _this.serverInvoker.onAjaxResponseError(jqXHR, status, error);
                _this.filenameInput.val("");
            };
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
            this.deleteButton = this.container.find(".delete-file").click(function (e) { return _this.onDeleteButtonClicked(); });
        }
        FileUpload.prototype.enable = function () {
            this.input.attr("data-url", this.url.effectiveUrlProvider("/upload", this.input));
            var options = {
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
            this.input.filestyle(options);
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
            this.input.fileupload({
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
            });
        };
        FileUpload.prototype.fixMasterDetailsInputName = function () {
            var nameParts = this.input.attr("name").split(".");
            this.input.attr("name", nameParts[nameParts.length - 1]);
        };
        FileUpload.prototype.hasExistingFile = function () {
            if (!this.currentFileLink) {
                return false;
            }
            var name = this.currentFileLink.text();
            if (!name) {
                return false;
            }
            if (name === "«UNCHANGED»") {
                return false;
            }
            if (name === "NoFile.Empty") {
                return false;
            }
            return true;
        };
        FileUpload.prototype.showExistingFile = function () {
            var _this = this;
            this.deleteButton.show();
            this.progressBar.width("100%");
            this.existingFileNameInput
                .val(this.currentFileLink.text())
                .removeAttr("disabled")
                .addClass("file-target")
                .attr("readonly", "readonly")
                .click(function () { return _this.currentFileLink[0].click(); });
        };
        FileUpload.prototype.removeExistingFile = function () {
            if (!this.hasExistingFile()) {
                return;
            }
            this.existingFileNameInput.removeClass("file-target").attr("disabled", "true").off();
        };
        FileUpload.prototype.onDeleteButtonClicked = function () {
            this.deleteButton.hide();
            this.actionInput.val("Removed");
            this.setValidationValue("");
            this.progressBar.width(0);
            this.input.filestyle("clear");
            this.removeExistingFile();
        };
        FileUpload.prototype.onDragDropped = function (e, data) {
            if (this.filenameInput.length > 0 && data.files.length > 0) {
                this.filenameInput.val(data.files.map(function (x) { return x.name; }));
            }
        };
        FileUpload.prototype.onProgressAll = function (e, data) {
            var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
            this.progressBar.width(progress + "%");
        };
        FileUpload.prototype.onUploadSuccess = function (response) {
            if (response.Error) {
                this.serverInvoker.onAjaxResponseError({ responseText: response.Error }, "error", response.Error);
                this.filenameInput.val("");
            }
            else {
                if (this.input.is("[multiple]")) {
                    this.tempFileIdInput.val(this.tempFileIdInput.val() + "|" + response.Result.ID);
                    this.filenameInput.val(this.filenameInput.val() + ", " + response.Result.Name);
                }
                else {
                    this.tempFileIdInput.val(response.Result.ID);
                    this.filenameInput.val(response.Result.Name);
                }
                this.deleteButton.show();
                this.setValidationValue("value");
            }
        };
        FileUpload.prototype.onUploadCompleted = function (response) {
            crossDomainEvent_1.default.raise(parent, "file-uploaded", response);
        };
        FileUpload.prototype.onChange = function (e, data) {
            this.progressBar.width(0);
            this.removeExistingFile();
        };
        FileUpload.prototype.setValidationValue = function (value) {
            this.validationInput.val(value);
            this.input.closest("form").validate().element(this.validationInput);
        };
        return FileUpload;
    }());
    exports.default = FileUpload;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2ZpbGVVcGxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFNQSx5QkFBeUI7SUFDekIsb0RBQW9EO0lBQ3BELGdEQUFnRDtJQUVoRDtRQUVJLDJCQUNZLEdBQVEsRUFDUixhQUE0QjtZQUQ1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Isa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBSSxDQUFDO1FBRXRDLGtDQUFNLEdBQWIsVUFBYyxRQUFnQjtZQUE5QixpQkFFQztZQURHLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUEzRCxDQUEyRCxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0FBQyxBQVRELElBU0M7SUFUWSw4Q0FBaUI7SUFXOUI7UUFZSSxvQkFBb0IsS0FBYSxFQUFVLEdBQVEsRUFBVSxhQUE0QjtZQUF6RixpQkFnQkM7WUFoQm1CLFVBQUssR0FBTCxLQUFLLENBQVE7WUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQVUsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFnSGpGLGtCQUFhLEdBQUcsVUFBQyxLQUFnQixFQUFFLE1BQWMsRUFBRSxLQUFhO2dCQUNwRSxLQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdELEtBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQTtZQWxIRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUVqQyw0QkFBNEI7WUFDNUIs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