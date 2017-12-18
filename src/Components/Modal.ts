import WindowContext from 'olive/Components/WindowContext'

export default class Modal {
    current: any = null;
    isOpening: boolean = false;
    isClosingModal: boolean = false;
    url: string;
    modalOptions: any = {};

    static initialize() {
        window["isModal"] = () => {
            if ($(window.getContainerIFrame()).closest(".modal").length === 0) return false;
            return true;
        };

        window["getContainerIFrame"] = () => {
            if (parent == null || parent == self) return null;
            else return <HTMLIFrameElement>$(parent.document).find("iframe")
                .filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
        };
    }

    constructor(event?: JQueryEventObject, targeturl?: string, opt?: any) {
        let target = event ? $(event.currentTarget) : null;
        this.url = targeturl ? targeturl : target.attr("href");
        let options = opt ? opt : target.attr("data-modal-options");
        if (options) this.modalOptions = WindowContext.toJson(options);
    }

    open() {
        this.isOpening = true;
        if (this.current != null)
            if (this.close() === false) return false;

        this.current = $(this.getModalTemplate(this.modalOptions));

        if (true /* TODO: Change to if Internet Explorer only */)
            this.current.removeClass("fade");

        var frame = this.current.find("iframe");

        frame.attr("src", this.url).on("load", (e) => {
            this.isOpening = false;
            var isHeightProvided = !!(this.modalOptions && this.modalOptions.height);
            if (!isHeightProvided) {
                var doc = frame.get(0).contentWindow.document;
                setTimeout(() => frame.height(doc.body.offsetHeight), 10); // Timeout is used due to an IE bug.
            }
            this.current.find(".modal-body .text-center").remove();
        });

        $("body").append(this.current);
        this.current.modal('show');
    }

    close() {
        if ($.raiseEvent("modal:closing", window) === false) return false;
        this.isClosingModal = true;

        if (this.current) {
            this.current.modal('hide').remove();
            this.current = null;
            $.raiseEvent("modal:closed", window);
        }

        this.isClosingModal = false;
        return true;
    }

    getModalTemplate(options: any) {

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

    public static ensureHeight() {
        setTimeout(() => this.adjustHeight(), 1);
    }

    public static adjustHeight(overflow?: number) {
        if (window.isModal()) {
            var frame = $(window.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    }

    public static expandToFitPicker(target: any) {
        var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');

        if (datepicker.length === 0) {
            this.adjustHeight();
            return;
        }

        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustHeight(overflow);
    }

    public static ensureNonModal() {
        if (window.isModal())
            parent.window.location.href = location.href;
    }
}