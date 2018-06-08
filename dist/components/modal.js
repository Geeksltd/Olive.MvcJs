define(["require", "exports", "olive/components/url", "olive/components/crossDomainEvent"], function (require, exports, url_1, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Modal = /** @class */ (function () {
        function Modal(event, targeturl, opt) {
            this.isOpening = false;
            this.modalOptions = {};
            var target = event ? $(event.currentTarget) : null;
            this.url = targeturl ? targeturl : target.attr("href");
            this.url = url_1.default.effectiveUrlProvider(this.url, target);
            var options = opt ? opt : (target ? target.attr("data-modal-options") : null);
            if (options)
                this.modalOptions = JSON.safeParse(options);
        }
        Modal.enalbeEnsureHeight = function (selector) {
            var _this = this;
            selector.off("click.tab-toggle").on("click.tab-toggle", function () { return _this.ensureHeight(); });
        };
        Modal.initialize = function () {
            var _this = this;
            crossDomainEvent_1.default.handle('set-iframe-height', function (x) { return _this.setIFrameHeight(x); });
            crossDomainEvent_1.default.handle('close-modal', function (x) { return _this.close(); });
            window["isModal"] = function () {
                try {
                    return window.self !== window.parent;
                }
                catch (e) {
                    return true;
                }
            };
        };
        Modal.setIFrameHeight = function (arg) {
            try {
                var iframe = $("iframe").filter(function (i, f) { return f["src"] == arg.url; });
                if (iframe.attr("data-has-explicit-height") === 'true')
                    return;
                iframe.height(arg.height);
            }
            catch (error) {
                console.error(error);
            }
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
                Modal.current.find(".modal-body .text-center").remove();
            });
            $("body").append(Modal.current);
            Modal.current.modal('show');
        };
        Modal.closeMe = function () {
            crossDomainEvent_1.default.raise(parent, "close-modal");
            return true;
        };
        Modal.close = function () {
            this.isClosingModal = true;
            if (this.current) {
                this.current.modal('hide').remove();
                this.current = null;
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
                crossDomainEvent_1.default.raise(parent, "set-iframe-height", {
                    url: window.location.href,
                    height: document.body.offsetHeight + (overflow || 0)
                });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBT0ksZUFBWSxLQUF5QixFQUFFLFNBQWtCLEVBQUUsR0FBUztZQUxwRSxjQUFTLEdBQVksS0FBSyxDQUFDO1lBRzNCLGlCQUFZLEdBQVEsRUFBRSxDQUFDO1lBR25CLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25ELElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdkQsSUFBSSxDQUFDLEdBQUcsR0FBRyxhQUFHLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV0RCxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUUsSUFBSSxPQUFPO2dCQUFFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRWEsd0JBQWtCLEdBQWhDLFVBQWlDLFFBQWdCO1lBQWpELGlCQUEwSTtZQUFyRixRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLGNBQU0sT0FBQSxLQUFJLENBQUMsWUFBWSxFQUFFLEVBQW5CLENBQW1CLENBQUMsQ0FBQztRQUFDLENBQUM7UUFF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