import Waiting from 'olive/Components/Waiting'
import Validate from 'olive/Components/Validate'
import MasterDetail from 'olive/Components/MasterDetail'
import Form from 'olive/Components/Form'
import Config from "olive/Config"
import AjaxRedirect from 'olive/Mvc/AjaxRedirect'
import StandardAction from 'olive/Mvc/StandardAction'
import LiteEvent from 'olive/Components/LiteEvent'

export interface IViewUpdatedEventArgs {
    container: JQuery;
    trigger: any;
    isNewPage: boolean;
}

export default class FormAction {

    public static isAwaitingAjaxResponse = false;
    static events: { [event: string]: Function[] } = {};
    static dynamicallyLoadedScriptFiles = [];

    public static onViewChanged = new LiteEvent<IViewUpdatedEventArgs>();

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

    public static invokeWithAjax(event, actionUrl, syncCall = false) {

        var trigger = $(event.currentTarget);
        var triggerUniqueSelector = trigger.getUniqueSelector();
        var containerModule = trigger.closest("[data-module]");

        if (Validate.validateForm(trigger) == false) { Waiting.hide(); return false; }
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
            success: (result) => { Waiting.hide(); this.processAjaxResponse(result, containerModule, trigger); },
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
        Waiting.hide();
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

    public static processAjaxResponse(response, containerModule, trigger) {

        var asElement = $(response);

        if (asElement.is("main")) {
            this.replaceMain(asElement, trigger);
            return;
        }

        if (asElement.is("[data-module]")) {
            containerModule.replaceWith(asElement);
            this.raiseViewChanged(asElement, trigger);
            return;
        }

        if (response.length == 1 && response[0].ReplaceView) {
            asElement = $("<div/>").append(response[0].ReplaceView);
            containerModule.replaceWith(asElement);
            this.raiseViewChanged(asElement, trigger);
            return;
        }

        if (trigger && trigger.is("[data-add-subform]")) {
            var subFormName = trigger.attr("data-add-subform");
            var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");

            if (container.length == 0)
                container = containerModule.find("[data-subform=" + subFormName + "]:first");

            container.append(asElement);
            Validate.reloadRules(trigger.parents("form"));
            MasterDetail.updateSubFormStates();
            this.raiseViewChanged(asElement, trigger);
            return;
        }

        // List of actions
        StandardAction.runAll(response, trigger);
    }

    static raiseViewChanged(container, trigger, isNewPage: boolean = false) {
        this.onViewChanged.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
    }

    static replaceMain(element: JQuery, trigger) {
        var referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
        element.find("script[src]").remove();

        $("main").replaceWith(element);

        if (referencedScripts.length) {
            var expectedScripts = referencedScripts.length;
            var loadedScripts = 0;
            referencedScripts.each((index, item) => {
                var url = '' + item;
                if (this.dynamicallyLoadedScriptFiles.indexOf(url) > -1) {
                    loadedScripts++;
                    if (loadedScripts == expectedScripts)
                        this.raiseViewChanged(element, trigger, true);
                }
                else {
                    this.dynamicallyLoadedScriptFiles.push(url);
                    $.getScript(url, () => {
                        loadedScripts++;
                        if (loadedScripts == expectedScripts)
                            this.raiseViewChanged(element, trigger, true);
                    });
                }
            });
        }
        else this.raiseViewChanged(element, trigger, true);

        document.title = $("#page_meta_title").val();
    }
}