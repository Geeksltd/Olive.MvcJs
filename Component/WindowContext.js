"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WindowContext = (function () {
    function WindowContext() {
    }
    WindowContext.getInstance = function () {
        if (!WindowContext.instance)
            WindowContext.instance = new WindowContext();
        return WindowContext.instance;
    };
    WindowContext.prototype.isWindowModal = function () {
        if ($(this.getContainerIFrame()).closest(".modal").length === 0)
            return false;
        return true;
    };
    WindowContext.prototype.getContainerIFrame = function () {
        if (parent == null || parent == self)
            return null;
        return $(parent.document).find("iframe").filter(function (i, f) { return (f.contentDocument || f.contentWindow.document) == document; }).get(0);
    };
    WindowContext.prototype.adjustModalHeight = function (overflow) {
        if (this.isWindowModal()) {
            var frame = $(this.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    };
    WindowContext.prototype.adjustModalHeightForDataPicker = function (e) {
        var datepicker = $(e.currentTarget).siblings('.bootstrap-datetimepicker-widget');
        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }
        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    };
    return WindowContext;
}());
exports.WindowContext = WindowContext;
//# sourceMappingURL=WindowContext.js.map