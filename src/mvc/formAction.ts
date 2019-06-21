import Waiting from 'olive/components/waiting'
import Validate from 'olive/components/validate'
import MasterDetail from 'olive/components/masterDetail'
import Form from 'olive/components/form'
import Url from 'olive/components/url'
import Config from "olive/config"
import StandardAction from 'olive/mvc/standardAction'
import LiteEvent from 'olive/components/liteEvent'
import Modal from '../components/modal';

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

    public static enableInvokeWithAjax(selector: JQuery, event: string, attrName: string) {
        selector.off(event).on(event,
            (e) => {
                let trigger = $(e.currentTarget);
                let url = Url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                this.invokeWithAjax(e, url, false);
                return false;
            });
    }

    public static enableinvokeWithPost(selector: JQuery) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost(e)); }

    static invokeWithPost(event) {
        let trigger = $(event.currentTarget);
        let containerModule = trigger.closest("[data-module]");
        if (containerModule.is("form") && Validate.validateForm(trigger) == false) return false;

        let data = Form.getPostData(trigger);
        let url = Url.effectiveUrlProvider(trigger.attr("formaction"), trigger);
        let form = $("<form method='post' />").hide().appendTo($("body"));

        for (let item of data)
            $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
        form.attr("action", url).submit();
        return false;
    }

    static invokeWithAjax(event, actionUrl, syncCall = false) {

        let trigger = $(event.currentTarget);
        let triggerUniqueSelector: string = trigger.getUniqueSelector();
        let containerModule = trigger.closest("[data-module]");

        if (Validate.validateForm(trigger) == false) { Waiting.hide(); return false; }
        let data_before_disable = Form.getPostData(trigger);
        let disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
        if (disableToo) trigger.attr('disabled', 'disabled');
        trigger.addClass('loading-action-result');
        this.isAwaitingAjaxResponse = true;

        actionUrl = Url.effectiveUrlProvider(actionUrl, trigger);

        // If the request is cross domain, jquery won't send the header: X-Requested-With
        data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });

        const scrollPosition = $(window).scrollTop();

        $.ajax({
            url: actionUrl,
            type: trigger.attr("data-ajax-method") || 'POST',
            xhrFields: { withCredentials: true },
            async: !syncCall,
            data: data_before_disable,
            success: (result) => { $(".tooltip").remove(); Waiting.hide(); this.processAjaxResponse(result, containerModule, trigger, null); },
            error: this.onAjaxResponseError,
            statusCode: {
                401: (data) => {
                    Url.onAuthenticationFailed();
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

    public static onAjaxResponseError(jqXHR: JQueryXHR, status: string, error: string) {
        Waiting.hide();

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


    public static processAjaxResponse(response, containerModule, trigger, args) {

        let asElement = $(response);

        if (asElement.is("main")) {
            this.navigate(asElement, trigger, args);
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


    static navigate(element: JQuery, trigger, args) {

        let referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
        let referencedCss = element.find("link[rel='stylesheet']").map((i, s) => $(s).attr("href"));
        element.find("script[src]").remove();
        element.find("link[rel='stylesheet']").remove();

        //check for CSS links in the main tag after ajax call
        if (referencedCss.length > 0) {
            let contentLoaded: boolean = false;
            referencedCss.each((i, item: any) => {

                if (!contentLoaded) {
                    //first add CSS files and then load content.
                    $("head").append($('<link rel="stylesheet" type="text/css" />')
                        .attr("href", item).load(item, () => { this.processWithTheContent(trigger, element, args, referencedScripts); }));

                    contentLoaded = true;
                }
                else if ($("link[href='" + item + "']") && $("link[href='" + item + "']").length === 0) {
                    $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", item));
                }
            });
        }
        else
            this.processWithTheContent(trigger, element, args, referencedScripts);
    }

    private static processWithTheContent(trigger, element, args, referencedScripts) {

        let width = $(window).width();

        let oldMain = trigger.closest("main");
        if (oldMain.length === 0) oldMain = $("main");

        let tooltips = $('body > .tooltip');

        tooltips.each((index, elem) => {
            if ($('[aria-discribedby=' + elem.id + ']'))
                elem.remove();
        });

        if (width <= 800 && trigger.data("transition") == "slide") {
            let newMain = element.appendTo(oldMain.parent());
            oldMain.css("position", "fixed");

            if (args == "back") {
                newMain.addClass("w3-animate-left");
                oldMain.addClass("w3-animate-righter");
            }
            else {
                newMain.addClass("w3-animate-right");
                oldMain.addClass("w3-animate-lefter");
            }

            setTimeout(function () {
                oldMain.remove();
                newMain.removeClass("w3-animate-left").removeClass("w3-animate-right");
                FormAction.updateUrl(referencedScripts, element, trigger);
            }, 400);
        }
        else {
            oldMain.replaceWith(element);
            this.updateUrl(referencedScripts, element, trigger);
        }
    }

    private static updateUrl(referencedScripts, element, trigger) {
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

        //open modal if needed
        Modal.tryOpenFromUrl();
        //if (!window.isModal() && Url.getQuery("_modal") !== "") {
        //    let url: string = Url.getQuery("_modal");
        //    new Modal(null, url).open(false);
        //}
    }
}
