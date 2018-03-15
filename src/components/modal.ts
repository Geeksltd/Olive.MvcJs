import Url from 'olive/components/url'

export default class Modal {
    static current: any = null;
    isOpening: boolean = false;
    static isClosingModal: boolean = false;
    url: string;
    modalOptions: any = {};

    public static enalbeEnsureHeight(selector: JQuery) { selector.off("click.tab-toggle").on("click.tab-toggle", () => this.ensureHeight()); }

    static initialize() {

        window.addEventListener("message", e => {
            try {

                let arg = JSON.parse(e.data);
                if (arg.command !== 'set-iframe-height') return;
                let iframe = $("iframe").filter((i, f) => f["src"] == arg.url);
                if (iframe.attr("data-has-explicit-height") === 'true') return;
                iframe.height(arg.height);
            } catch (error) {
                console.error(error);
            }
        }, false);

        window["isModal"] = () => {
            try {
                return window.self !== window.parent;
            } catch (e) {
                return true;
            }
        };
    }

    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any) {
        let target = event ? $(event.currentTarget) : null;
        this.url = targeturl ? targeturl : target.attr("href");

        this.url = Url.effectiveUrlProvider(this.url, $(event.target));

        let options = opt ? opt : target.attr("data-modal-options");
        if (options) this.modalOptions = JSON.safeParse(options);
    }

    open() {
        this.isOpening = true;
        if (Modal.current)
            if (Modal.close() === false) return false;

        Modal.current = $(this.getModalTemplate(this.modalOptions));

        if (true /* TODO: Change to if Internet Explorer only */)
            Modal.current.removeClass("fade");

        let frame = Modal.current.find("iframe");

        frame.attr("src", this.url).on("load", e => {
            this.isOpening = false;
            let isHeightProvided = !!(this.modalOptions && this.modalOptions.height);
            if (!isHeightProvided) {
                let doc = frame.get(0).contentWindow.document;
                setTimeout(() => frame.height(doc.body.offsetHeight), 10); // Timeout is used due to an IE bug.
            }
            Modal.current.find(".modal-body .text-center").remove();
        });

        $("body").append(Modal.current);
        Modal.current.modal('show');
    }

    public static close() {

        this.isClosingModal = true;

        if (this.current) {
            this.current.modal('hide').remove();
            this.current = null;
        }

        this.isClosingModal = false;
        return true;
    }

    getModalTemplate(options: any) {

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
            parent.postMessage(JSON.stringify({
                command: "set-iframe-height",
                url: window.location.href,
                height: document.body.offsetHeight + (overflow || 0)
            }), "*");
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
}
