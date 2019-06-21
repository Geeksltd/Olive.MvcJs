import Url from 'olive/components/url';
import CrossDomainEvent from 'olive/components/crossDomainEvent';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';

export default class Modal {
    static current: any = null;
    static currentModal: Modal = null;
    isOpening: boolean = false;
    static isAjaxModal: boolean = false;
    static isClosingModal: boolean = false;
    opener: JQuery;
    url: string;
    rawUrl: string;
    modalOptions: any = {};
    scrollPosition: number;

    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any) {
        let target = event ? $(event.currentTarget) : null;
        this.opener = target;
        this.url = targeturl ? targeturl : target.attr("href");
        this.rawUrl = this.url;
        this.url = Url.effectiveUrlProvider(this.url, target);

        let options = opt ? opt : (target ? target.attr("data-modal-options") : null);
        if (options) this.modalOptions = JSON.safeParse(options);
    }

    public static enableEnsureHeight(selector: JQuery) { selector.off("click.tab-toggle").on("click.tab-toggle", () => this.ensureHeight()); }

    static initialize() {

        CrossDomainEvent.handle('set-iframe-height', x => this.setIFrameHeight(x));
        CrossDomainEvent.handle('close-modal', x => this.close());

        window["isModal"] = () => {
            try {
                if (Modal.isAjaxModal) return true;
                return window.self !== window.parent;
            } catch (e) {
                return true;
            }
        };
    }

    static setIFrameHeight(arg: any) {
        try {
            let iframe = $("iframe").filter((i, f) => f["src"] == arg.url);
            if (iframe.attr("data-has-explicit-height") === 'true') return;
            iframe.height(arg.height + 30); //we have 30px padding
        } catch (error) {
            console.error(error);
        }
    }

    open(changeUrl: boolean = true): boolean {
        this.isOpening = true;
        Modal.isAjaxModal = true;
        if (Modal.current) { if (Modal.close() === false) { return false; } }

        Modal.current = $(this.getModalTemplateForAjax(this.modalOptions));
        Modal.currentModal = this;
        this.scrollPosition = $(window).scrollTop();

        AjaxRedirect.go(this.url, $(Modal.current).find("main"), true, this.shouldKeepScroll(), changeUrl);

        $("body").append(Modal.current);

        Modal.current.modal("show");

        Modal.current.on('hidden.bs.modal', () => {
            CrossDomainEvent.raise(window.self, "close-modal");
        });
    }

    public static changeUrl(url: string, iframe: boolean = false) {
        let currentPath: string = Url.removeQuery(Url.current(), "_modal");
        currentPath = Url.removeQuery(currentPath, "_iframe");

        if (currentPath.endsWith("?"))
            currentPath = currentPath.trimEnd("?");

        if (Url.isAbsolute(url)) {
            let pathArray: Array<string> = url.split("/").splice(3);
            url = pathArray.join("/");
        }

        let modalUrl: string = Url.addQuery(currentPath, "_modal", url);

        if (iframe) {
            modalUrl = Url.addQuery(modalUrl, "_iframe", "true");
        }

        AjaxRedirect.defaultOnRedirected("", modalUrl);
    }





    static openWithUrl(): void {
        if (Url.getQuery("_iframe") === "true") {
            new Modal(null, Url.getQuery("_modal")).openiFrame(false);
        }
        else {
            new Modal(null, Url.getQuery("_modal")).open(false);
        }
    }

    openiFrame(changeUrl: boolean = true) {
        this.isOpening = true;
        Modal.isAjaxModal = false;
        if (Modal.current)
            if (Modal.close() === false) return false;

        Modal.current = $(this.getModalTemplateForiFrame(this.modalOptions));
        Modal.currentModal = this;
        this.scrollPosition = $(window).scrollTop();

        if (true /* TODO: Change to if Internet Explorer only */)
            Modal.current.removeClass("fade");

        let frame = Modal.current.find("iframe");

        const url = this.url;

        frame.attr("src", url).on("load", e => {
            this.isOpening = false;
            if (changeUrl) {
                Modal.changeUrl(url, true);
            }
            Modal.current.find(".modal-body .text-center").remove();
        });

        $("body").append(Modal.current);
        Modal.current.modal('show');
        Modal.current.on('hidden.bs.modal', () => {
            CrossDomainEvent.raise(window.self, "close-modal");
        });
    }

    public static closeMe() {
        if (!this.isAjaxModal) { CrossDomainEvent.raise(parent, "close-modal"); }
        this.close();

        $('body > .tooltip').each((index, elem) => {
            if ($('[aria-discribedby=' + elem.id + ']'))
                elem.remove();
        });

        return true;
    }

    public static close(): boolean {
        this.isClosingModal = true;

        if (this.current) {
            if (this.currentModal.shouldKeepScroll()) {
                $(window).scrollTop(this.currentModal.scrollPosition);
            }

            var onClosingEvent = new CustomEvent('onClosingEvent');
            this.current[0].dispatchEvent(onClosingEvent);

            this.current.modal('hide');
            this.current.remove();
            this.current = null;
            this.currentModal = null;
        }

        $('body > .tooltip').each((index, elem) => {
            if ($('[aria-describedby=' + elem.id + ']'))
                elem.remove();
        });

        this.isClosingModal = false;
        this.isAjaxModal = false;

        //remove modal query string
        var currentPath = Url.removeQuery(Url.current(), "_modal");
        var currentPath = Url.removeQuery(currentPath, "_iframe");

        if (currentPath.endsWith("?"))
            currentPath = currentPath.trimEnd("?");

        AjaxRedirect.defaultOnRedirected("", currentPath);

        return true;
    }

    shouldKeepScroll(): boolean {
        if (this.modalOptions) {
            if (this.modalOptions.keepScroll) {
                return this.modalOptions.keepScroll;
            }
        }
        return true;
    }

    getModalTemplateForAjax(options: any): string {
        let modalDialogStyle: string = "";

        if (options) {
            if (options.width) {
                modalDialogStyle += "width:" + options.width + ";";
            }

            if (options.height) {
                modalDialogStyle += "height:" + options.height + ";";
            }
        }

        return (
            "<div class='modal' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
           aria-hidden='true'>\
              <div class='modal-dialog' style='" + modalDialogStyle + "'>\
              <div class='modal-content'>\
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

    getModalTemplateForiFrame(options: any) {

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
                    <div class='modal-dialog' style='"+ modalDialogStyle + "'>\
            <div class='modal-content'>\
            <div class='modal-header'>\
                <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                    <i class='fa fa-times-circle'></i>\
                </button>\
            </div>\
            <div class='modal-body'>\
                <div class='row text-center'><i class='fa fa-spinner fa-spin fa-2x'></i></div>\
                <iframe style='"+ iframeStyle + "' " + iframeAttributes + "></iframe>\
            </div>\
        </div></div></div>";
    }

    static ensureHeight() {
        setTimeout(() => this.adjustHeight(), 1);
    }

    public static adjustHeight(overflow?: number) {
        if (window.isModal()) {

            CrossDomainEvent.raise(parent, "set-iframe-height",
                {
                    url: window.location.href,
                    height: document.body.scrollHeight + (overflow || 0)
                });
        }
    }

    public static expandToFitPicker(target: any) {
        let datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');

        if (datepicker.length === 0) {
            this.adjustHeight();
            return;
        }

        let offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        let overflow = Math.max(offset, 0);
        this.adjustHeight(overflow);
    }

    public static ensureNonModal() {
        if (window.isModal())
            parent.window.location.href = location.href;
    }

    public static tryOpenFromUrl() {
        if (Url.getQuery("_modal") && $('.modal-dialog').length == 0)
            this.openWithUrl();
    }
}
