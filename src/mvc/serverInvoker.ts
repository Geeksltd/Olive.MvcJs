import Url from "olive/components/url";
import Waiting from "olive/components/waiting";
import Form from "olive/components/form";
import Validate from "olive/components/validate";
import Config from "olive/config";
import ResponseProcessor from "./responseProcessor";

export default class ServerInvoker implements IService {
    public isAwaitingAjaxResponse = false;

    constructor(
        private url: Url,
        private validate: Validate,
        private waiting: Waiting,
        private form: Form,
        private responseProcessor: ResponseProcessor
    ) { }

    public enableInvokeWithAjax(selector: JQuery, event: string, attrName: string) {
        selector.off(event).on(event,
            (e) => {
                let trigger = $(e.currentTarget);
                let url = this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                this.invokeWithAjax(e, url, false);
                return false;
            });
    }

    public enableinvokeWithPost(selector: JQuery) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost(e)); }

    private invokeWithPost(event) {
        let trigger = $(event.currentTarget);
        let containerModule = trigger.closest("[data-module]");
        if (containerModule.is("form") && this.validate.validateForm(trigger) == false) return false;

        let data = this.form.getPostData(trigger);
        let url = this.url.effectiveUrlProvider(trigger.attr("formaction"), trigger);
        let form = $("<form method='post' />").hide().appendTo($("body"));

        for (let item of data)
            $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
        form.attr("action", url).submit();
        return false;
    }

    public invokeWithAjax(event: JQueryEventObject, actionUrl: string, syncCall = false) {

        let trigger = $(event.currentTarget);
        let triggerUniqueSelector: string = trigger.getUniqueSelector();
        let containerModule = trigger.closest("[data-module]");

        if (this.validate.validateForm(trigger) == false) { this.waiting.hide(); return false; }
        let data_before_disable = this.form.getPostData(trigger);
        let disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
        if (disableToo) trigger.attr('disabled', 'disabled');
        trigger.addClass('loading-action-result');
        this.isAwaitingAjaxResponse = true;

        actionUrl = this.url.effectiveUrlProvider(actionUrl, trigger);

        // If the request is cross domain, jquery won't send the header: X-Requested-With
        data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });

        const scrollPosition = $(window).scrollTop();

        $.ajax({
            url: actionUrl,
            type: trigger.attr("data-ajax-method") || 'POST',
            xhrFields: { withCredentials: true },
            async: !syncCall,
            data: data_before_disable,
            success: (result) => { $(".tooltip").remove(); this.waiting.hide(); this.responseProcessor.processAjaxResponse(result, containerModule, trigger, null); },
            error: this.onAjaxResponseError,
            statusCode: {
                401: (data) => {
                    this.url.onAuthenticationFailed();
                }
            },
            complete: (x) => {
                this.isAwaitingAjaxResponse = false;
                trigger.removeClass('loading-action-result');
                if (disableToo) trigger.removeAttr('disabled');

                let triggerTabIndex: number = $(":focusable").not("[tabindex='-1']").index($(triggerUniqueSelector));

                if (!trigger.is("button") && !trigger.is("a")) {
                    //trigger element is not a button, image or link so we should select next element.
                    triggerTabIndex++;
                }

                if (triggerTabIndex > -1) $(":focusable").not("[tabindex='-1']").eq(triggerTabIndex).focus();
                $(window).scrollTop(scrollPosition);
            }
        });

        return false;
    }

    public onAjaxResponseError = (jqXHR: JQueryXHR, status: string, error: string) => {
        this.waiting.hide();

        let text = jqXHR.responseText;

        if (text) {
            if (text.indexOf("<html") > -1) {
                document.write(text);
            }
            else if (text.indexOf("<form") > -1) {
                let form = $("form", document);
                if (form.length) form.replaceWith($(text));
                else document.write(text);
            }
            else alert(text);
        }
        else if (error) alert(error);
        else alert("Error: response status: " + status);
    }
}