import Waiting from 'olive/components/waiting'
import Url from 'olive/components/url'
// import FormAction, { IViewUpdatedEventArgs } from 'olive/mvc/formAction'
import { ModalHelper } from 'olive/components/modal';
import MasterDetail from 'olive/components/masterDetail';
import Validate from 'olive/components/validate';
import LiteEvent from 'olive/components/liteEvent';
// import StandardAction from './standardAction';
import Form from 'olive/components/form';
import Config from 'olive/config';
import Select from 'olive/plugins/select';
// import AjaxRedirect from './ajaxRedirect';
import CrossDomainEvent from 'olive/components/crossDomainEvent';
import Alert from 'olive/components/alert';


export interface IViewUpdatedEventArgs {
    container: JQuery;
    trigger: any;
    isNewPage: boolean;
}

export default class CombinedUtilities implements IService {
    private requestCounter_ar = 0;
    private ajaxChangedUrl_ar = 0;
    private isAjaxRedirecting_ar = false;
    public onRedirected_ar: ((title: string, url: string) => void) = this.defaultOnRedirected_ar;
    public onRedirectionFailed_ar: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed_ar;


    public isAwaitingAjaxResponse_fa = false;
    public events_fa: { [event: string]: Function[] } = {};
    private dynamicallyLoadedScriptFiles_fa = [];

    public onViewChanged_fa = new LiteEvent<IViewUpdatedEventArgs>();

    constructor(
        private url: Url,
        // private formAction: FormAction,
        private waiting: Waiting,
        private modalHelper: ModalHelper,
        private validate: Validate,
        private masterDetail: MasterDetail,
        // private standardAction: StandardAction,
        private form: Form,
        // private ajaxRedirect: AjaxRedirect,
        private select: Select,
        private alert: Alert
    ) { }

    public defaultOnRedirected_ar(title: string, url: string) {
        history.pushState({}, title, url);
    }

    public defaultOnRedirectionFailed_ar(url: string, response: JQueryXHR) {
        if (confirm("Request failed. Do you want to see the error details?"))
            open(url, "_blank");
    }

    public enableBack_ar(selector: JQuery) {
        selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back_ar(e));
    }

    public enableRedirect_ar(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", e => this.redirect_ar(e));
    }

    private redirect_ar(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) return true;
        let link = $(event.currentTarget);
        let url = link.attr('href');
        this.go_ar(url, link, false, false, true);
        return false;
    }

    private back_ar(event) {
        if (this.modalHelper.isOrGoingToBeModal())
            window.location.reload();
        else {
            if (this.ajaxChangedUrl_ar == 0) return;
            this.ajaxChangedUrl_ar--;
            this.go_ar(location.href, null, true, false, false);
        }
    }

    public go_ar(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false,
        addToHistory = true) {

        if (!trigger) trigger = $(window);

        url = this.url.effectiveUrlProvider(url, trigger);

        if (url.indexOf(this.url.baseContentUrl + "/##") == 0) {
            url = url.substring(this.url.baseContentUrl.length).substring(3);
            console.log("## Redirecting to " + url);
        }

        this.isAjaxRedirecting_ar = true;
        this.isAwaitingAjaxResponse_fa = true;

        const requestCounter = ++this.requestCounter_ar;
        if (window.stop) window.stop();
        else if (document.execCommand !== undefined) document.execCommand("Stop", false);

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }

        this.waiting.show(false, false);

        $.ajax({
            url: url,
            type: 'GET',
            xhrFields: { withCredentials: true },
            success: (response) => {
                this.events_fa = {};

                if (!isBack) {
                    this.ajaxChangedUrl_ar++;
                    if (addToHistory && !window.isModal()) {

                        var title = $("#page_meta_title").val();

                        let addressBar = trigger.attr("data-addressbar") || url;
                        try {
                            this.onRedirected_ar(title, addressBar);
                        } catch (error) {
                            addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                            history.pushState({}, title, addressBar);
                        }
                    }
                }

                if (addToHistory) {
                    if (window.isModal() && addToHistory) this.modalHelper.changeUrl(url);
                }

                this.isAwaitingAjaxResponse_fa = false;
                this.isAjaxRedirecting_ar = false;

                this.processAjaxResponse_fa(response, null, trigger, isBack ? "back" : null);
                if (keepScroll) $(document).scrollTop(scrollTopBefore);
            },
            error: (response) => {
                if (this.requestCounter_ar == requestCounter)
                    this.onRedirectionFailed_ar(url, response);
            },
            complete: (response) => this.waiting.hide()
        });
        return false;
    }




    public enableInvokeWithAjax_fa(selector: JQuery, event: string, attrName: string) {
        selector.off(event).on(event,
            (e) => {
                let trigger = $(e.currentTarget);
                let url = this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                this.invokeWithAjax_fa(e, url, false);
                return false;
            });
    }

    public enableinvokeWithPost_fa(selector: JQuery) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost_fa(e)); }

    private invokeWithPost_fa(event) {
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

    public invokeWithAjax_fa(event, actionUrl, syncCall = false) {

        let trigger = $(event.currentTarget);
        let triggerUniqueSelector: string = trigger.getUniqueSelector();
        let containerModule = trigger.closest("[data-module]");

        if (this.validate.validateForm(trigger) == false) { this.waiting.hide(); return false; }
        let data_before_disable = this.form.getPostData(trigger);
        let disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
        if (disableToo) trigger.attr('disabled', 'disabled');
        trigger.addClass('loading-action-result');
        this.isAwaitingAjaxResponse_fa = true;

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
            success: (result) => { $(".tooltip").remove(); this.waiting.hide(); this.processAjaxResponse_fa(result, containerModule, trigger, null); },
            error: this.onAjaxResponseError_fa,
            statusCode: {
                401: (data) => {
                    this.url.onAuthenticationFailed();
                }
            },
            complete: (x) => {
                this.isAwaitingAjaxResponse_fa = false;
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

    public onAjaxResponseError_fa(jqXHR: JQueryXHR, status: string, error: string) {
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


    public processAjaxResponse_fa(response, containerModule, trigger, args) {

        let asElement = $(response);

        if (asElement.is("main")) {
            this.navigate_fa(asElement, trigger, args);
            return;
        }

        if (asElement.is("[data-module]")) {
            containerModule.replaceWith(asElement);
            this.raiseViewChanged_fa(asElement, trigger);
            return;
        }

        if (response.length == 1 && response[0].ReplaceView) {
            asElement = $("<div/>").append(response[0].ReplaceView);
            containerModule.replaceWith(asElement);
            this.raiseViewChanged_fa(asElement, trigger);
            return;
        }

        if (trigger && trigger.is("[data-add-subform]")) {
            let subFormName = trigger.attr("data-add-subform");
            let container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");

            if (container.length == 0)
                container = containerModule.find("[data-subform=" + subFormName + "]:first");

            container.append(asElement);
            this.validate.reloadRules(trigger.parents("form"));
            this.masterDetail.updateSubFormStates();
            this.raiseViewChanged_fa(asElement, trigger);
            return;
        }

        // List of actions
        this.runAll_sa(response, trigger);
    }

    private raiseViewChanged_fa(container, trigger, isNewPage: boolean = false) {
        this.onViewChanged_fa.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
    }


    private navigate_fa(element: JQuery, trigger, args) {

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
                        .attr("href", item).load(item, () => { this.processWithTheContent_fa(trigger, element, args, referencedScripts); }));

                    contentLoaded = true;
                }
                else if ($("link[href='" + item + "']") && $("link[href='" + item + "']").length === 0) {
                    $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", item));
                }
            });
        }
        else
            this.processWithTheContent_fa(trigger, element, args, referencedScripts);
    }

    private processWithTheContent_fa(trigger, element, args, referencedScripts) {

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
                this.updateUrl(referencedScripts, element, trigger);
            }, 400);
        }
        else {
            oldMain.replaceWith(element);
            this.updateUrl_fa(referencedScripts, element, trigger);
        }
    }

    private updateUrl_fa(referencedScripts, element, trigger) {
        if (referencedScripts.length) {
            let expectedScripts = referencedScripts.length;
            let loadedScripts = 0;
            referencedScripts.each((index, item) => {
                let url = '' + item;
                if (this.dynamicallyLoadedScriptFiles_fa.indexOf(url) > -1) {
                    loadedScripts++;
                    if (loadedScripts == expectedScripts)
                        this.raiseViewChanged_fa(element, trigger, true);
                }
                else {
                    this.dynamicallyLoadedScriptFiles_fa.push(url);
                    $.getScript(url, () => {
                        loadedScripts++;
                        if (loadedScripts == expectedScripts)
                            this.raiseViewChanged_fa(element, trigger, true);
                    });
                }
            });
        }
        else this.raiseViewChanged_fa(element, trigger, true);

        document.title = $("#page_meta_title").val();

        //open modal if needed
        this.modalHelper.tryOpenFromUrl();
        //if (!window.isModal() && Url.getQuery("_modal") !== "") {
        //    let url: string = Url.getQuery("_modal");
        //    new Modal(null, url).open(false);
        //}
    }






    public enableLinkModal_sa(selector: JQuery) {
        selector.off("click.open-modal").on("click.open-modal", (e) => {
            if ($(e.currentTarget).attr("data-mode") === "iframe") {
                this.openModaliFrame_sa(e);
            }
            else {
                this.openModal_sa(e);
            }

            return false;
        });
    }

    public runStartup_sa(container: JQuery = null, trigger: any = null, stage: string = "Init") {
        if (container == null) container = $(document);
        if (trigger == null) trigger = $(document);
        let actions = [];
        $("input[name='Startup.Actions']", container).each((index, item) => {
            let action = $(item).val();
            if (actions.indexOf(action) === -1) {
                //sometimes, we have a duplicate route in the action string, so we should remove them manually.
                let names = action.trimStart("[{").trimEnd("}]").split("},{");
                let uniqueNames = [];
                $.each(names, (i, el) => {
                    if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
                });
                let stringResult = "[{";
                $.each(uniqueNames, (i, itm) => {
                    stringResult += itm + "},{";
                });
                stringResult = stringResult.trimEnd(",{") + "]";
                actions.push(stringResult);
            }

        });

        for (let action of actions) {
            if (action && (action.Stage || "Init") == stage) this.runAll_sa(JSON.safeParse(action), trigger);
        }
    }

    public runAll_sa(actions: any, trigger: any = null) {
        for (let action of actions) {
            if (!this.run_sa(action, trigger)) return;
        }
    }

    private run_sa(action: any, trigger: any): boolean {
        if (action.Notify || action.Notify == "") this.notify_sa(action, trigger);
        else if (action.Script) eval(action.Script);
        else if (action.BrowserAction == "Back") window.history.back();
        else if (action.BrowserAction == "CloseModal") { if (window.page.modal.closeMe() === false) return false; }
        else if (action.BrowserAction == "CloseModalRebindParent") {
            let opener = this.modalHelper.currentModal.opener;
            if (window.page.modal.closeMe() === false) return false;
            if (opener) {
                let data = this.form.getPostData(opener.parents('form'));
                $.post(window.location.href, data, (response) => {
                    this.processAjaxResponse_fa(response, opener.closest("[data-module]"), opener, null);
                });
            }
            else {
                CrossDomainEvent.raise(parent, 'refresh-page');
            }
        }
        else if (action.BrowserAction == "CloseModalRefreshParent") {
            window.page.modal.closeMe();
            CrossDomainEvent.raise(parent, 'refresh-page');
        }
        else if (action.BrowserAction == "Close") window.close();
        else if (action.BrowserAction == "Refresh") window.page.refresh();
        else if (action.BrowserAction == "Print") window.print();
        else if (action.BrowserAction == "ShowPleaseWait") this.waiting.show(action.BlockScreen);
        else if (action.ReplaceSource) this.select.replaceSource(action.ReplaceSource, action.Items);
        else if (action.Download) window.download(action.Download);
        else if (action.Redirect) this.redirect_sa(action, trigger);
        else alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());

        return true;
    }

    private notify_sa(action: any, trigger: any) {
        if (action.Obstruct == false)
            this.alert.alertUnobtrusively(action.Notify, action.Style);
        else this.alert.alert(action.Notify, action.Style);
    }

    private redirect_sa(action: any, trigger: any) {
        if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
            action.Redirect = '/' + action.Redirect;

        if (action.OutOfModal && window.isModal()) parent.window.location.href = action.Redirect;
        else if (action.Target == '$modal') this.openModal_sa({ currentTarget: trigger }, action.Redirect, null);
        else if (action.Target && action.Target != '') window.open(action.Redirect, action.Target);
        else if (action.WithAjax === false) location.replace(action.Redirect);
        else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
            this.go_ar(action.Redirect, trigger, false, false, true);
        else location.replace(action.Redirect);
    }

    private openModal_sa(event, url?, options?): any {
        this.modalHelper.close();
        this.modalHelper.open(event, url, options);
    }

    private openModaliFrame_sa(event, url?, options?): void {
        this.modalHelper.close();
        this.modalHelper.openiFrame(event, url, options);
    }
}
