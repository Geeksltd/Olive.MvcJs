define(["require", "exports", "olive/mvc/formAction", "olive/components/url"], function (require, exports, formAction_1, url_1) {
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
            this.input.attr("data-url", url_1.default.effectiveUrlProvider("/upload", this.input));
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
                error: this.onUploadError,
                success: this.onUploadSuccess.bind(this),
                xhrFields: { withCredentials: true }
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
        FileUpload.prototype.onUploadError = function (jqXHR, status, error) {
            formAction_1.default.onAjaxResponseError(jqXHR, status, error);
            this.fileLabel.val('');
        };
        FileUpload.prototype.onUploadSuccess = function (response) {
            if (response.Error) {
                formAction_1.default.onAjaxResponseError({ responseText: response.Error }, "error", response.Error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVVwbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2ZpbGVVcGxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQSx5QkFBeUI7SUFDekIscURBQXFEO0lBQ3JELGdEQUFnRDtJQUVoRDtRQVlJLG9CQUFZLFdBQW1CO1lBQS9CLGlCQU1DO1lBTEcsSUFBSSxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUM7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBNUIsQ0FBNEIsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7UUFSYSxpQkFBTSxHQUFwQixVQUFxQixRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQTdCLENBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFVbEcsMkJBQU0sR0FBTjtZQUNJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxhQUFHLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksUUFBUSxFQUFFO2dCQUNoQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO2FBQ3JHO1lBRUQsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUU7Z0JBQ2hFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTVCLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUNsQixRQUFRLEVBQUUsTUFBTTtnQkFDaEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN4QixnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0JBQ3pCLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLFNBQVMsRUFBRSxFQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUM7YUFDckMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELG9DQUFlLEdBQWY7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWU7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDeEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUN4QixJQUFJLElBQUksS0FBSyxhQUFhO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBQ3pDLElBQUksSUFBSSxLQUFLLGNBQWM7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDMUMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVELHFDQUFnQixHQUFoQjtZQUFBLGlCQVNDO1lBUkcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUvQixJQUFJLENBQUMscUJBQXFCO2lCQUNyQixHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDaEMsVUFBVSxDQUFDLFVBQVUsQ0FBQztpQkFDdEIsUUFBUSxDQUFDLGFBQWEsQ0FBQztpQkFDdkIsS0FBSyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELHVDQUFrQixHQUFsQjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUFFLE9BQU87WUFDcEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pGLENBQUM7UUFFRCwwQ0FBcUIsR0FBckI7WUFDSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFRCxrQ0FBYSxHQUFiLFVBQWMsQ0FBQyxFQUFFLElBQUk7WUFDakIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUMsQ0FBQzthQUNuRDtRQUNMLENBQUM7UUFFRCxrQ0FBYSxHQUFiLFVBQWMsQ0FBQyxFQUFFLElBQVM7WUFDdEIsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsa0NBQWEsR0FBYixVQUFjLEtBQWdCLEVBQUUsTUFBYyxFQUFFLEtBQWE7WUFDekQsb0JBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFFRCxvQ0FBZSxHQUFmLFVBQWdCLFFBQVE7WUFDcEIsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFO2dCQUNoQixvQkFBVSxDQUFDLG1CQUFtQixDQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUMxQjtpQkFDSTtnQkFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQztvQkFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztvQkFDakcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDNUI7UUFDTCxDQUFDO1FBRUQsNkJBQVEsR0FBUixVQUFTLENBQUMsRUFBRSxJQUFJO1lBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUIsQ0FBQztRQUNMLGlCQUFDO0lBQUQsQ0FBQyxBQWhIRCxJQWdIQyJ9