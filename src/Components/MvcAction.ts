import Waiting from 'olive/Components/Waiting'
import Validate from 'olive/Components/Validate'
import Form from 'olive/Components/Form'
import Config from "olive/Config"

export default class MvcAction {

    public static isAwaitingAjaxResponse = false;
    static events: { [event: string]: Function[] } = {};

    public static invokeWithPost(event) {
        var trigger = $(event.currentTarget);
        var containerModule = trigger.closest("[data-module]");
        if (containerModule.is("form") && Validate.validateForm(trigger) == false) return false;

        var data = Form.getPostData(trigger);
        var url = trigger.attr("formaction");
        var form = $("<form method='post' />").hide().appendTo($("body"));

        for (var item of data)
            $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
        form.attr("action", url).submit();
        return false;
    }

    public static invokeWithAjax(event, actionUrl, syncCall = false, callback) {

        var trigger = $(event.currentTarget);
        var triggerUniqueSelector = trigger.getUniqueSelector();
        var containerModule = trigger.closest("[data-module]");

        if (Validate.validateForm(trigger) == false) { Waiting.hidePleaseWait(); return false; }
        var data_before_disable = Form.getPostData(trigger);
        var disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
        if (disableToo) trigger.attr('disabled', 'disabled');
        trigger.addClass('loading-action-result');
        this.isAwaitingAjaxResponse = true;

        $.ajax({
            url: actionUrl,
            type: trigger.attr("data-ajax-method") || 'POST',
            async: !syncCall,
            data: data_before_disable,
            success: (result) => { Waiting.hidePleaseWait(); callback(result, containerModule, trigger); },
            error: (response) => this.onAjaxResponseError(response),
            complete: (x) => {
                this.isAwaitingAjaxResponse = false;
                trigger.removeClass('loading-action-result');
                if (disableToo) trigger.removeAttr('disabled');
                var triggerTabIndex = $(":focusable").index($(triggerUniqueSelector));
                if (triggerTabIndex > -1) $(":focusable").eq(triggerTabIndex + 1).focus();
            }
        });

        return false;
    }

    public static onAjaxResponseError(response) {
        Waiting.hidePleaseWait();
        console.error(response);

        var text = response.responseText;
        if (text.indexOf("<html") > -1) {
            document.write(text);
        }
        else if (text.indexOf("<form") > -1) {
            var form = $("form", document);
            if (form.length) form.replaceWith($(text));
            else document.write(text);
        }
        else alert(text);
    }
}