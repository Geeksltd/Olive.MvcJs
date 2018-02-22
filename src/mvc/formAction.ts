import Waiting from 'olive/components/waiting'
import Validate from 'olive/components/validate'
import MasterDetail from 'olive/components/masterDetail'
import Form from 'olive/components/form'
import Config from "olive/config"
import AjaxRedirect from 'olive/mvc/ajaxRedirect'
import StandardAction from 'olive/mvc/standardAction'
import LiteEvent from 'olive/components/liteEvent'

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


    public static enableInvokeWithAjax(selector: JQuery, event: string, attrName: string) { selector.off(event).on(event, (e) => this.invokeWithAjax(e, $(e.currentTarget).attr(attrName), false)); }

    public static enableinvokeWithPost(selector: JQuery) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost(e)); }

    static invokeWithPost(event) {
        let trigger = $(event.currentTarget);
        let containerModule = trigger.closest("[data-module]");
        if (containerModule.is("form") && Validate.validateForm(trigger) == false) return false;

        let data = Form.getPostData(trigger);
        let url = trigger.attr("formaction");
        let form = $("<form method='post' />").hide().appendTo($("body"));

        for (let item of data)
            $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
        form.attr("action", url).submit();
        return false;
    }

    static invokeWithAjax(event, actionUrl, syncCall = false) {

        let trigger = $(event.currentTarget);
        let triggerUniqueSelector = trigger.getUniqueSelector();
        let containerModule = trigger.closest("[data-module]");

        if (Validate.validateForm(trigger) == false) { Waiting.hide(); return false; }
        let data_before_disable = Form.getPostData(trigger);
        let disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
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
                let triggerTabIndex = $(":focusable").index($(triggerUniqueSelector));
                if (triggerTabIndex > -1) $(":focusable").eq(triggerTabIndex + 1).focus();
            }
        });

        return false;
    }

    public static onAjaxResponseError(response) {
        Waiting.hide();
        console.error(response);

        let text = response.responseText;
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

    public static processAjaxResponse(response, containerModule, trigger) {

        let asElement = $(response);

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
            let subFormName = trigger.attr("data-add-subform");
            let container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");

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
        let referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
        element.find("script[src]").remove();

        $("main").replaceWith(element);

        if (referencedScripts.length) {
            let expectedScripts = referencedScripts.length;
            let loadedScripts = 0;
            referencedScripts.each((index, item) => {
                let url = '' + item;
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
