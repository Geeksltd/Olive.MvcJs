define(["require", "exports", "olive/Components/WindowContext"], function (require, exports, WindowContext_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Modal = /** @class */ (function () {
        function Modal(event, targeturl, opt) {
            this.currentModal = null;
            this.isOpeningModal = false;
            this.isClosingModal = false;
            this.modalOptions = {};
            var target = event ? $(event.currentTarget) : null;
            this.url = targeturl ? targeturl : target.attr("href");
            var options = opt ? opt : target.attr("data-modal-options");
            if (options)
                this.modalOptions = WindowContext_1.default.toJson(options);
        }
        Modal.prototype.openModal = function () {
            var _this = this;
            this.isOpeningModal = true;
            if (this.currentModal != null)
                if (this.closeModal() === false)
                    return false;
            this.currentModal = $(this.getModalTemplate(this.modalOptions));
            if (true /* TODO: Change to if Internet Explorer only */)
                this.currentModal.removeClass("fade");
            var frame = this.currentModal.find("iframe");
            frame.attr("src", this.url).on("load", function (e) {
                _this.isOpeningModal = false;
                var isHeightProvided = !!(_this.modalOptions && _this.modalOptions.height);
                if (!isHeightProvided) {
                    var doc = frame.get(0).contentWindow.document;
                    setTimeout(function () { return frame.height(doc.body.offsetHeight); }, 10); // Timeout is used due to an IE bug.
                }
                _this.currentModal.find(".modal-body .text-center").remove();
            });
            this.currentModal.appendTo("body").modal('show');
        };
        Modal.prototype.closeModal = function () {
            if ($.raiseEvent("modal:closing", window) === false)
                return false;
            this.isClosingModal = true;
            if (this.currentModal) {
                this.currentModal.modal('hide').remove();
                this.currentModal = null;
                $.raiseEvent("modal:closed", window);
            }
            this.isClosingModal = false;
            return true;
        };
        Modal.prototype.getModalTemplate = function (options) {
            var modalDialogStyle = "";
            var iframeStyle = "width:100%; border:0;";
            var iframeAttributes = "";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + ";";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                    iframeStyle += "height:" + options.height + ";";
                    iframeAttributes += " data-has-explicit-height='true'";
                }
            }
            return "<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
         aria-hidden='true'>\
                    <div class='modal-dialog' style='" + modalDialogStyle + "'>\
            <div class='modal-content'>\
            <div class='modal-header'>\
                <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                    <i class='fa fa-times-circle'></i>\
                </button>\
            </div>\
            <div class='modal-body'>\
                <div class='row text-center'><i class='fa fa-spinner fa-spin fa-2x'></i></div>\
                <iframe style='" + iframeStyle + "' " + iframeAttributes + "></iframe>\
            </div>\
        </div></div></div>";
        };
        return Modal;
    }());
    exports.default = Modal;
});
//# sourceMappingURL=Modal.js.map