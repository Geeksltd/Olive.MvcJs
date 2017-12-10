export class WindowContext {
    private static instance: WindowContext;

    static getInstance() {
        if (!WindowContext.instance) WindowContext.instance = new WindowContext();
        return WindowContext.instance;
    }

    public isWindowModal() {
        if ($(this.getContainerIFrame()).closest(".modal").length === 0) return false;
        return true;
    }

    public getContainerIFrame() {
        if (parent == null || parent == self) return null;
        return $(parent.document).find("iframe").filter((i, f: any) => (f.contentDocument || f.contentWindow.document) == document).get(0);
    }

    public adjustModalHeight(overflow?: number) {
        if (this.isWindowModal()) {

            var frame = $(this.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    }

    public adjustModalHeightForDataPicker(e) {

        var datepicker = $(e.currentTarget).siblings('.bootstrap-datetimepicker-widget');

        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }

        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    }
}