import Waiting from 'olive/components/waiting'
import Url from 'olive/components/url'
import FormAction from 'olive/mvc/formAction'
import Modal from 'olive/components/modal';

export default class AjaxRedirect {
    static requestCounter = 0;
    static ajaxChangedUrl = 0;
    static isAjaxRedirecting = false;
    public static onRedirected: ((title: string, url: string) => void) = AjaxRedirect.defaultOnRedirected;
    public static onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = AjaxRedirect.defaultOnRedirectionFailed;

    static defaultOnRedirected(title: string, url: string) {
        history.pushState({}, title, url);
    }

    public static defaultOnRedirectionFailed(url: string, response: JQueryXHR) {
        if (confirm("Request failed. Do you want to see the error details?"))
            open(url, "_blank");
    }

    public static enableBack(selector: JQuery) {
        selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
    }

    public static enableRedirect(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", e => this.redirect(e));
    }

    static redirect(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) return true;
        let link = $(event.currentTarget);
        let url = link.attr('href');
        this.go(url, link, false, false, true);
        return false;
    }

    static back(event) {
        if (Modal.isOrGoingToBeModal())
            window.location.reload();
        else {
            if (this.ajaxChangedUrl == 0) return;
            this.ajaxChangedUrl--;
            this.go(location.href, null, true, false, false);
        }
    }

    public static go(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false,
        addToHistory = true) {

        if (!trigger) trigger = $(window);

        url = Url.effectiveUrlProvider(url, trigger);

        if (url.indexOf(Url.baseContentUrl + "/##") == 0) {
            url = url.substring(Url.baseContentUrl.length).substring(3);
            console.log("## Redirecting to " + url);
        }

        this.isAjaxRedirecting = true;
        FormAction.isAwaitingAjaxResponse = true;

        const requestCounter = ++AjaxRedirect.requestCounter;
        if (window.stop) window.stop();
        else if (document.execCommand !== undefined) document.execCommand("Stop", false);

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }

        Waiting.show(false, false);

        $.ajax({
            url: url,
            type: 'GET',
            xhrFields: { withCredentials: true },
            success: (response) => {
                FormAction.events = {};

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory && !window.isModal()) {

                        var title = $("#page_meta_title").val();

                        let addressBar = trigger.attr("data-addressbar") || url;
                        try {
                            this.onRedirected(title, addressBar);
                        } catch (error) {
                            addressBar = Url.makeAbsolute(Url.baseContentUrl, "/##" + addressBar);
                            history.pushState({}, title, addressBar);
                        }
                    }
                }

                if (addToHistory) {
                    if (window.isModal() && addToHistory) Modal.changeUrl(url);
                }

                FormAction.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;

                FormAction.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
                if (keepScroll) $(document).scrollTop(scrollTopBefore);
            },
            error: (response) => {
                if (AjaxRedirect.requestCounter == requestCounter)
                    this.onRedirectionFailed(url, response);
            },
            complete: (response) => Waiting.hide()
        });
        return false;
    }
}
