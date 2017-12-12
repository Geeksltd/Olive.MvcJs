"use strict";
///<reference path="../application.urlhelper.ts"/>
///<reference path="../typings/jquery/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("../../../lib/jquery/dist/jquery.js");
class WindowContext {
    static isWindowModal() {
        if ($(this.getContainerIFrame()).closest(".modal").length === 0)
            return false;
        return true;
    }
    static getContainerIFrame() {
        if (parent == null || parent == self)
            return null;
        return $(parent.document).find("iframe").filter((i, f) => (f.contentDocument || f.contentWindow.document) == document).get(0);
    }
    static adjustModalHeightForDataPicker(target) {
        var datepicker = $(target.currentTarget).siblings('.bootstrap-datetimepicker-widget');
        if (datepicker.length === 0) {
            this.adjustModalHeight();
            return;
        }
        var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
        var overflow = Math.max(offset, 0);
        this.adjustModalHeight(overflow);
    }
    static adjustModalHeight(overflow) {
        if (this.isWindowModal()) {
            var frame = $(this.getContainerIFrame());
            if (frame.attr("data-has-explicit-height") != 'true')
                frame.height(document.body.offsetHeight + (overflow || 0));
        }
    }
    static getPostData(trigger) {
        var form = trigger.closest("[data-module]");
        if (!form.is("form"))
            form = $("<form />").append(form.clone(true));
        var data = urlHelper.mergeFormData(form.serializeArray());
        // If it's master-details, then we need the index.
        var subFormContainer = trigger.closest(".subform-item");
        if (subFormContainer != null) {
            data.push({
                name: "subFormIndex",
                value: subFormContainer.closest(".horizontal-subform, .vertical-subform").find(".subform-item").index(subFormContainer).toString()
            });
        }
        data.push({ name: "current.request.url", value: urlHelper.pathAndQuery() });
        return data;
    }
    static handleAjaxResponseError(response) {
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
    }
    static hidePleaseWait() {
        $(".wait-screen").remove();
    }
}
WindowContext.setting = {
    TIME_FORMAT: "HH:mm",
    MINUTE_INTERVALS: 5,
    DATE_LOCALE: "en-gb"
};
exports.WindowContext = WindowContext;
//# sourceMappingURL=WindowContext.js.map