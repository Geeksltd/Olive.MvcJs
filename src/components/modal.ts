import Url from "olive/components/url";
import CrossDomainEvent from "olive/components/crossDomainEvent";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";

export class ModalHelper implements IService {
    public current: any = null;
    public currentModal: Modal = null;
    public isAjaxModal: boolean = false;
    public isClosingModal: boolean = false;

    constructor(
        private url: Url,
        private ajaxRedirect: AjaxRedirect,
        private responseProcessor: ResponseProcessor,
    ) { }

    public enableLink(selector: JQuery) {
        selector.off("click.open-modal").on("click.open-modal", (e) => {
            this.close();

            if ($(e.currentTarget).attr("data-mode") === "iframe") {
                this.openiFrame(e);
            } else {
                this.open(e);
            }

            return false;
        });
    }

    public initialize() {

        CrossDomainEvent.handle("set-iframe-height", (x) => this.setIFrameHeight(x));
        CrossDomainEvent.handle("close-modal", (x) => this.close());

        this.responseProcessor.processCompleted.handle(() => this.tryOpenFromUrl());

        window.isModal = () => {
            try {
                if (this.isAjaxModal) { return true; }
                return $("myModal").length > 0;
                // return window.self !== window.parent;
            } catch (e) {
                return true;
            }
        };
    }

    private closeMe() {
        if (!this.isAjaxModal) { CrossDomainEvent.raise(parent, "close-modal"); }
        this.close();

        $("body > .tooltip").each((index, elem) => {
            if ($("[aria-discribedby=" + elem.id + "]")) {
                elem.remove();
            }
        });

        return true;
    }

    public close(): boolean {
        this.isClosingModal = true;

        if (this.current) {
            if (this.currentModal.shouldKeepScroll()) {
                $(window).scrollTop(this.currentModal.scrollPosition);
            }

            const onClosingEvent = new CustomEvent("onClosingEvent");
            this.current[0].dispatchEvent(onClosingEvent);

            this.current.modal("hide");
            this.current.remove();
            this.current = null;
            this.currentModal = null;
        }

        $("body > .tooltip").each((index, elem) => {
            if ($("[aria-describedby=" + elem.id + "]")) {
                elem.remove();
            }
        });

        this.isClosingModal = false;
        this.isAjaxModal = false;

        // remove modal query string
        let currentPath = this.url.removeQuery(this.url.current(), "_modal");
        currentPath = this.url.removeQuery(currentPath, "_iframe");

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        history.pushState({}, "", currentPath);

        return true;
    }

    private setIFrameHeight(arg: any) {
        try {
            const iframe = $("iframe").filter((_, f: HTMLIFrameElement) => f.src === arg.url);
            if (iframe.attr("data-has-explicit-height") === "true") { return; }
            iframe.height(arg.height + 30); // we have 30px padding
        } catch (error) {
            console.error(error);
        }
    }

    public enableEnsureHeight(selector: JQuery) {
        selector.off("click.tab-toggle").on("click.tab-toggle", () => this.ensureHeight());
    }

    private ensureHeight() {
        setTimeout(() => this.adjustHeight(), 1);
    }

    public adjustHeight(overflow?: number) {
        if (window.isModal()) {

            CrossDomainEvent.raise(parent, "set-iframe-height",
                {
                    url: window.location.href,
                    height: document.body.scrollHeight + (overflow || 0),
                });
        }
    }

    public expandToFitPicker(target: any) {
        const datepicker = $(target.currentTarget).siblings(".bootstrap-datetimepicker-widget");

        if (datepicker.length === 0) {
            this.adjustHeight();
            return;
        }

        const offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        const overflow = Math.max(offset, 0);
        this.adjustHeight(overflow);
    }

    private ensureNonModal() {
        if (window.isModal()) {
            parent.window.location.href = location.href;
        }
    }

    public tryOpenFromUrl() {
        if (this.url.getQuery("_modal") && $(".modal-dialog").length === 0) {
            this.openWithUrl();
        }
    }

    public changeUrl(url: string, iframe: boolean = false) {

        let currentPath: string = this.url.removeQuery(this.url.current(), "_modal");
        currentPath = this.url.removeQuery(currentPath, "_iframe");

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        if (this.url.isAbsolute(url)) {
            const pathArray: string[] = url.split("/").splice(3);
            url = pathArray.join("/");
        }

        let modalUrl: string = this.url.addQuery(currentPath, "_modal", encodeURIComponent(url));

        if (iframe) {
            modalUrl = this.url.addQuery(modalUrl, "_iframe", "true");
        }

        history.pushState({}, "", modalUrl);
    }

    public isOrGoingToBeModal(): boolean {
        return window.isModal() || !!this.url.getQuery("_modal");
    }

    public open(event?: JQueryEventObject, url?: string, options?: any) {
        new Modal(this.url, this.ajaxRedirect, this, event, url, options).open();
    }

    public openiFrame(event?: JQueryEventObject, url?: string, options?: any) {
        new Modal(this.url, this.ajaxRedirect, this, event, url, options).openiFrame();
    }

    protected openWithUrl(): void {

        if (this.url.getQuery("_iframe") === "true") {
            new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).openiFrame(false);
        } else {
            new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).open(false);
        }
    }
}

export default class Modal {
    public isOpening: boolean = false;
    public opener: JQuery;
    private url: string;
    private rawUrl: string;
    private modalOptions: any = {};
    public scrollPosition: number;

    constructor(
        private urlService: Url,
        private ajaxRedirect: AjaxRedirect,
        private helper: ModalHelper,
        event?: JQueryEventObject,
        targeturl?: string,
        opt?: any) {

        const target = event ? $(event.currentTarget) : null;
        this.opener = target;
        this.url = targeturl ? targeturl : target.attr("href");
        this.rawUrl = this.url;
        this.url = this.urlService.effectiveUrlProvider(this.url, target);

        const options = opt ? opt : (target ? target.attr("data-modal-options") : null);
        if (options) { this.modalOptions = JSON.safeParse(options); }
    }

    public open(changeUrl: boolean = true): boolean {
        this.isOpening = true;
        this.helper.isAjaxModal = true;
        if (this.helper.current) { if (this.helper.close() === false) { return false; } }

        this.helper.current = $(this.getModalTemplateForAjax(this.modalOptions));
        this.helper.currentModal = this;
        this.scrollPosition = $(window).scrollTop();

        this.ajaxRedirect.go(this.url,
            $(this.helper.current).find("main"),
            true,
            this.shouldKeepScroll(),
            changeUrl,
            () => {
                if (changeUrl && window.isModal()) {
                    this.helper.changeUrl(this.url);
                }
            });

        $("body").append(this.helper.current);

        this.helper.current.modal("show");

        this.helper.current.on("hidden.bs.modal", () => {
            CrossDomainEvent.raise(window.self, "close-modal");
        });
    }

    public openiFrame(changeUrl: boolean = true) {
        this.isOpening = true;
        this.helper.isAjaxModal = false;
        if (this.helper.current) {
            if (this.helper.close() === false) { return false; }
        }

        this.helper.current = $(this.getModalTemplateForiFrame(this.modalOptions));
        this.helper.currentModal = this;
        this.scrollPosition = $(window).scrollTop();

        if (true /* TODO: Change to if Internet Explorer only */) {
            this.helper.current.removeClass("fade");
        }

        const frame = this.helper.current.find("iframe");

        const url = this.url;

        frame.attr("src", url).on("load", (e) => {
            this.isOpening = false;
            if (changeUrl) {
                this.helper.changeUrl(url, true);
            }
            this.helper.current.find(".modal-body .text-center").remove();
        });

        $("body").append(this.helper.current);
        this.helper.current.modal("show");
        this.helper.current.on("hidden.bs.modal", () => {
            CrossDomainEvent.raise(window.self, "close-modal");
        });
    }

    public shouldKeepScroll(): boolean {
        if (this.modalOptions) {
            if (this.modalOptions.keepScroll) {
                return this.modalOptions.keepScroll;
            }
        }
        return true;
    }

    protected getModalTemplateForAjax(options: any): string {
        let modalDialogStyle: string = "";

        if (options) {
            if (options.width) {
                modalDialogStyle += "width:" + options.width + "; max-width: none;";
            }

            if (options.height) {
                modalDialogStyle += "height:" + options.height + ";";
            }
        }

        return (
            "<div class='modal' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
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
          </div></div></div>"
        );
    }

    protected getModalTemplateForiFrame(options: any) {

        let modalDialogStyle = "";
        let iframeStyle = "width:100%; border:0;";
        let iframeAttributes = "";

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
    }
}
