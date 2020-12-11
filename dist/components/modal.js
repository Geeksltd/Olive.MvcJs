define(["require", "exports", "olive/components/crossDomainEvent"], function (require, exports, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModalHelper = void 0;
    var ModalHelper = /** @class */ (function () {
        function ModalHelper(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.current = null;
            this.currentModal = null;
            this.isAjaxModal = false;
            this.isClosingModal = false;
        }
        ModalHelper.prototype.enableLink = function (selector) {
            var _this = this;
            selector.off("click.open-modal").on("click.open-modal", function (e) {
                _this.close();
                if ($(e.currentTarget).attr("data-mode") === "iframe") {
                    _this.openiFrame(e);
                }
                else {
                    _this.open(e);
                }
                return false;
            });
        };
        ModalHelper.prototype.initialize = function () {
            var _this = this;
            crossDomainEvent_1.default.handle("set-iframe-height", function (x) { return _this.setIFrameHeight(x); });
            crossDomainEvent_1.default.handle("close-modal", function (x) { return _this.close(); });
            this.responseProcessor.processCompleted.handle(function () { return _this.tryOpenFromUrl(); });
            window.isModal = function () {
                try {
                    if (_this.isAjaxModal) {
                        return true;
                    }
                    return $("myModal").length > 0;
                    // return window.self !== window.parent;
                }
                catch (e) {
                    return true;
                }
            };
        };
        ModalHelper.prototype.closeMe = function () {
            if (!this.isAjaxModal) {
                crossDomainEvent_1.default.raise(parent, "close-modal");
            }
            this.close();
            $("body > .tooltip").each(function (index, elem) {
                if ($("[aria-discribedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            return true;
        };
        ModalHelper.prototype.close = function () {
            this.isClosingModal = true;
            if (this.current) {
                if (this.currentModal.shouldKeepScroll()) {
                    $(window).scrollTop(this.currentModal.scrollPosition);
                }
                var onClosingEvent = new CustomEvent("onClosingEvent");
                this.current[0].dispatchEvent(onClosingEvent);
                this.current.modal("hide");
                this.current.remove();
                this.current = null;
                this.currentModal = null;
            }
            $("body > .tooltip").each(function (index, elem) {
                if ($("[aria-describedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            this.isClosingModal = false;
            this.isAjaxModal = false;
            // remove modal query string
            var currentPath = this.url.removeQuery(this.url.current(), "_modal");
            currentPath = this.url.removeQuery(currentPath, "_iframe");
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            history.pushState({}, "", currentPath);
            return true;
        };
        ModalHelper.prototype.setIFrameHeight = function (arg) {
            try {
                var iframe = $("iframe").filter(function (_, f) { return f.src === arg.url; });
                if (iframe.attr("data-has-explicit-height") === "true") {
                    return;
                }
                iframe.height(arg.height + 30); // we have 30px padding
            }
            catch (error) {
                console.error(error);
            }
        };
        ModalHelper.prototype.enableEnsureHeight = function (selector) {
            var _this = this;
            selector.off("click.tab-toggle").on("click.tab-toggle", function () { return _this.ensureHeight(); });
        };
        ModalHelper.prototype.ensureHeight = function () {
            var _this = this;
            setTimeout(function () { return _this.adjustHeight(); }, 1);
        };
        ModalHelper.prototype.adjustHeight = function (overflow) {
            if (window.isModal()) {
                crossDomainEvent_1.default.raise(parent, "set-iframe-height", {
                    url: window.location.href,
                    height: document.body.scrollHeight + (overflow || 0),
                });
            }
        };
        ModalHelper.prototype.expandToFitPicker = function (target) {
            var datepicker = $(target.currentTarget).siblings(".bootstrap-datetimepicker-widget");
            if (datepicker.length === 0) {
                this.adjustHeight();
                return;
            }
            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustHeight(overflow);
        };
        ModalHelper.prototype.ensureNonModal = function () {
            if (window.isModal()) {
                parent.window.location.href = location.href;
            }
        };
        ModalHelper.prototype.tryOpenFromUrl = function () {
            if (this.url.getQuery("_modal") && $(".modal-dialog").length === 0) {
                this.openWithUrl();
            }
        };
        ModalHelper.prototype.changeUrl = function (url, iframe) {
            if (iframe === void 0) { iframe = false; }
            var currentPath = this.url.removeQuery(this.url.current(), "_modal");
            currentPath = this.url.removeQuery(currentPath, "_iframe");
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            if (this.url.isAbsolute(url)) {
                var pathArray = url.split("/").splice(3);
                url = pathArray.join("/");
            }
            var modalUrl = this.url.addQuery(currentPath, "_modal", encodeURIComponent(url));
            if (iframe) {
                modalUrl = this.url.addQuery(modalUrl, "_iframe", "true");
            }
            history.pushState({}, "", modalUrl);
        };
        ModalHelper.prototype.isOrGoingToBeModal = function () {
            return window.isModal() || !!this.url.getQuery("_modal");
        };
        ModalHelper.prototype.open = function (event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).open();
        };
        ModalHelper.prototype.openiFrame = function (event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).openiFrame();
        };
        ModalHelper.prototype.openWithUrl = function () {
            if (this.url.getQuery("_iframe") === "true") {
                new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).openiFrame(false);
            }
            else {
                new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).open(false);
            }
        };
        return ModalHelper;
    }());
    exports.ModalHelper = ModalHelper;
    var Modal = /** @class */ (function () {
        function Modal(urlService, ajaxRedirect, helper, event, targeturl, opt) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.isOpening = false;
            this.modalOptions = {};
            var target = event ? $(event.currentTarget) : null;
            this.opener = target;
            this.url = targeturl ? targeturl : target.attr("href");
            this.rawUrl = this.url;
            this.url = this.urlService.effectiveUrlProvider(this.url, target);
            var options = opt ? opt : (target ? target.attr("data-modal-options") : null);
            if (options) {
                this.modalOptions = JSON.safeParse(options);
            }
        }
        Modal.prototype.open = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            this.isOpening = true;
            this.helper.isAjaxModal = true;
            if (this.helper.current) {
                if (this.helper.close() === false) {
                    return false;
                }
            }
            this.helper.current = $(this.getModalTemplateForAjax(this.modalOptions));
            this.helper.currentModal = this;
            this.scrollPosition = $(window).scrollTop();
            this.ajaxRedirect.go(this.url, $(this.helper.current).find("main"), true, this.shouldKeepScroll(), changeUrl, function () {
                if (changeUrl && window.isModal()) {
                    _this.helper.changeUrl(_this.url);
                }
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hidden.bs.modal", function () {
                crossDomainEvent_1.default.raise(window.self, "close-modal");
            });
        };
        Modal.prototype.openiFrame = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            this.isOpening = true;
            this.helper.isAjaxModal = false;
            if (this.helper.current) {
                if (this.helper.close() === false) {
                    return false;
                }
            }
            this.helper.current = $(this.getModalTemplateForiFrame(this.modalOptions));
            this.helper.currentModal = this;
            this.scrollPosition = $(window).scrollTop();
            if (true /* TODO: Change to if Internet Explorer only */) {
                this.helper.current.removeClass("fade");
            }
            var frame = this.helper.current.find("iframe");
            var url = this.url;
            frame.attr("src", url).on("load", function (e) {
                _this.isOpening = false;
                if (changeUrl) {
                    _this.helper.changeUrl(url, true);
                }
                _this.helper.current.find(".modal-body .text-center").remove();
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hidden.bs.modal", function () {
                crossDomainEvent_1.default.raise(window.self, "close-modal");
            });
        };
        Modal.prototype.shouldKeepScroll = function () {
            if (this.modalOptions) {
                if (this.modalOptions.keepScroll) {
                    return this.modalOptions.keepScroll;
                }
            }
            return true;
        };
        Modal.prototype.getModalTemplateForAjax = function (options) {
            var modalDialogStyle = "";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + "; max-width: none;";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                }
            }
            return ("<div class='modal' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
           aria-hidden='true'>\
              <div class='modal-dialog' style='" + modalDialogStyle + "'>\
              <div class='modal-content' >\
              <div class='modal-header'>\
                  <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                      <i class='fa fa-times-circle'></i>\
                  </button>\
              </div>\
              <div class='modal-body'>\
                  <main></main>\
              </div>\
          </div></div></div>");
        };
        Modal.prototype.getModalTemplateForiFrame = function (options) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9tb2RhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFLQTtRQU1JLHFCQUNZLEdBQVEsRUFDUixZQUEwQixFQUMxQixpQkFBb0M7WUFGcEMsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFSekMsWUFBTyxHQUFRLElBQUksQ0FBQztZQUNwQixpQkFBWSxHQUFVLElBQUksQ0FBQztZQUMzQixnQkFBVyxHQUFZLEtBQUssQ0FBQztZQUM3QixtQkFBYyxHQUFZLEtBQUssQ0FBQztRQU1uQyxDQUFDO1FBRUUsZ0NBQVUsR0FBakIsVUFBa0IsUUFBZ0I7WUFBbEMsaUJBWUM7WUFYRyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsQ0FBQztnQkFDdEQsS0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUViLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNuRCxLQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTTtvQkFDSCxLQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNoQjtnQkFFRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxnQ0FBVSxHQUFqQjtZQUFBLGlCQWdCQztZQWRHLDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztZQUM3RSwwQkFBZ0Is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