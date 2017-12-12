exports.__esModule = true;
var Form_1 = require("./Form");
var WindowContext = /** @class */ (function () {
    function WindowContext() {
    }
    WindowContext.isWindowModal = function () {
        if ($(this.getContainerIFrame()).closest(".modal").length === 0)
            return false;
        return true;
    };
    WindowContext.getContainerIFrame = function () {
        if (parent == null || parent == self)
            return null;
        return $(parent.document).find("iframe").filter(function (i, f) { return (f.contentDocument || f.contentWindow.document) == document; }).get(0);
    };
    WindowContext.adjustModalHeightForDataPicker = function (target) {
        var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');
        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }
        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    };
    WindowContext.adjustModalHeight = function (overflow) {
        if (this.isWindowModal()) {
            var frame = $(this.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    };
    WindowContext.getPostData = function (trigger) {
        var form = trigger.closest("[data-module]");
        if (!form.is("form"))
            form = $("<form />").append(form.clone(true));
        var data = Form_1.Form.merge(form.serializeArray());
        // If it's master-details, then we need the index.
        var subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer != null) {
            data.push({
                name: "subFormIndex",
                value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
            });
        }
        data.push({ name: "current.request.url", value: window.location.pathAndQuery() });
        return data;
    };
    WindowContext.handleAjaxResponseError = function (response) {
        this.hidePleaseWait();
        console.log(response);
        var text = response.responseText;
        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length)
                form.replaceWith($(text));
            else
                document.write(text);
        }
        else
            alert(text);
    };
    WindowContext.hidePleaseWait = function () {
        $(".wait-screen").remove();
    };
    WindowContext.setting = {
        TIME_FORMAT: "HH:mm",
        MINUTE_INTERVALS: 5,
        DATE_LOCALE: "en-gb"
    };
    return WindowContext;
}());
exports.WindowContext = WindowContext;
//# sourceMappingURL=WindowContext.js.map