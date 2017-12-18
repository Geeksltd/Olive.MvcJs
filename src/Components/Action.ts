import Waiting from 'olive/Components/Waiting'
import WindowContext from 'olive/Components/WindowContext'
import Validate from 'olive/Components/Validate'
import Form from 'olive/Components/Form'
import Config from "olive/Config"

export default class Action {

    static ajaxChangedUrl = 0;
    static isAjaxRedirecting = false;
    static isAwaitingAjaxResponse = false;

    public static ajaxRedirectBackClicked(event, backCallback) {
        if (this.ajaxChangedUrl == 0) return;
        this.ajaxChangedUrl--;
        this.ajaxRedirect(location.href, null, true, false, true, (response, containerModule, trigger) => { backCallback(response, containerModule, trigger); });
    }

    public static invokeActionWithPost(event) {
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

    public static enableAjaxRedirect(event: JQueryEventObject, callback) {

        if (event.ctrlKey || event.button === 1) return true;
        var link = $(event.currentTarget);
        var url = link.attr('href');
        this.ajaxRedirect(url, link, false, false, true, (response, containerModule, trigger) => { callback(response, containerModule, trigger); });
        return false;
    }

    public static invokeActionWithAjax(event, actionUrl, syncCall = false, callback) {

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
            error: (response) => this.handleAjaxResponseError(response),
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

    public static ajaxRedirect(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false, addToHistory = true, callback: (response: any, containerModule: JQuery, trigger: JQuery) => void) {
        this.isAjaxRedirecting = true;
        this.isAwaitingAjaxResponse = true;
        if (window.stop) window.stop();
        else if (document.execCommand !== undefined) document.execCommand("Stop", false);

        var scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }
        Waiting.showPleaseWait();

        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {
                WindowContext.events = {};

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory) history.pushState({}, $("#page_meta_title").val(), url);
                }

                this.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;
                callback(response, null, trigger);
                if (keepScroll) {
                    $(document).scrollTop(scrollTopBefore);
                }
            },
            error: (response) => location.href = url,
            complete: (response) => Waiting.hidePleaseWait()
        });
        return false;
    }

    public static handleAjaxResponseError(response) {
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
