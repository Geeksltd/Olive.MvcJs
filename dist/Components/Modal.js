define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Modal = /** @class */ (function () {
        function Modal(event, targeturl, opt) {
            this.isOpening = false;
            this.modalOptions = {};
            var target = event ? $(event.currentTarget) : null;
            this.url = targeturl ? targeturl : target.attr("href");
            var options = opt ? opt : target.attr("data-modal-options");
            if (options)
                this.modalOptions = JSON.safeParse(options);
        }
        Modal.enalbeEnsureHeight = function (selector) {
            var _this = this;
            selector.off("click.tab-toggle").on("click.tab-toggle", function () { return _this.ensureHeight(); });
        };
        Modal.initialize = function () {
            window["isModal"] = function () {
                if ($(window.getContainerIFrame()).closest(".modal").length === 0)
                    return false;
                return true;
            };
            window["getContainerIFrame"] = function () {
                if (parent == null || parent === self)
                    return null;
                else
                    return $(parent.document).find("iframe")
                        .filter(function (i, f) { return (f.contentDocument || f.contentWindow.document) === document; }).get(0);
            };
        };
        Modal.prototype.open = function () {
            var _this = this;
            this.isOpening = true;
            if (Modal.current)
                if (Modal.close() === false)
                    return false;
            Modal.current = $(this.getModalTemplate(this.modalOptions));
            if (true /* TODO: Change to if Internet Explorer only */)
                Modal.current.removeClass("fade");
            var frame = Modal.current.find("iframe");
            frame.attr("src", this.url).on("load", function (e) {
                _this.isOpening = false;
                var isHeightProvided = !!(_this.modalOptions && _this.modalOptions.height);
                if (!isHeightProvided) {
                    var doc_1 = frame.get(0).contentWindow.document;
                    setTimeout(function () { return frame.height(doc_1.body.offsetHeight); }, 10); // Timeout is used due to an IE bug.
                }
                Modal.current.find(".modal-body .text-center").remove();
            });
            $("body").append(Modal.current);
            Modal.current.modal('show');
        };
        Modal.close = function () {
            debugger;
            if ($.fn.raiseEvent("modal:closing", window) === false)
                return false;
            this.isClosingModal = true;
            if (this.current) {
                this.current.modal('hide').remove();
                this.current = null;
                $.fn.raiseEvent("modal:closed", window);
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
        Modal.ensureHeight = function () {
            var _this = this;
            setTimeout(function () { return _this.adjustHeight(); }, 1);
        };
        Modal.adjustHeight = function (overflow) {
            if (window.isModal()) {
                var frame = $(window.getContainerIFrame());
                if (frame.attr("data-has-explicit-height") != 'true')
                    frame.height(document.body.offsetHeight + (overflow || 0));
            }
        };
        Modal.expandToFitPicker = function (target) {
            var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');
            if (datepicker.length === 0) {
                this.adjustHeight();
                return;
            }
            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustHeight(overflow);
        };
        Modal.ensureNonModal = function () {
            if (window.isModal())
                parent.window.location.href = location.href;
        };
        Modal.current = null;
        Modal.isClosingModal = false;
        return Modal;
    }());
    exports.default = Modal;
});
//# sourceMappingURL=Modal.js.map