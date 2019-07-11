import Waiting from 'olive/components/waiting'
import Url from 'olive/components/url'
import FormAction from 'olive/mvc/formAction'
import { ModalHelper } from 'olive/components/modal';

export default class AjaxRedirect implements IService {
    private requestCounter = 0;
    private ajaxChangedUrl = 0;
    private isAjaxRedirecting = false;
    public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
    public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;

    constructor(
        private url: Url,
        private formAction: FormAction,
        private waiting: Waiting,
        private modalHelper: ModalHelper
    ) { }

    public defaultOnRedirected(title: string, url: string) {
        history.pushState({}, title, url);
    }

    public defaultOnRedirectionFailed(url: string, response: JQueryXHR) {
        if (confirm("Request failed. Do you want to see the error details?"))
            open(url, "_blank");
    }

    public enableBack(selector: JQuery) {
        selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
    }

    public enableRedirect(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", e => this.redirect(e));
    }

    private redirect(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) return true;
        let link = $(event.currentTarget);
        let url = link.attr('href');
        this.go(url, link, false, false, true);
        return false;
    }

    private back(event) {
        if (this.modalHelper.isOrGoingToBeModal())
            window.location.reload();
        else {
            if (this.ajaxChangedUrl == 0) return;
            this.ajaxChangedUrl--;
            this.go(location.href, null, true, false, false);
        }
    }

    public go(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false,
        addToHistory = true) {

        if (!trigger) trigger = $(window);

        url = this.url.effectiveUrlProvider(url, trigger);

        if (url.indexOf(this.url.baseContentUrl + "/##") == 0) {
            url = url.substring(this.url.baseContentUrl.length).substring(3);
            console.log("## Redirecting to " + url);
        }

        this.isAjaxRedirecting = true;
        this.formAction.isAwaitingAjaxResponse = true;

        const requestCounter = ++this.requestCounter;
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
                this.formAction.events = {};

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory && !window.isModal()) {

                        var title = $("#page_meta_title").val();

                        let addressBar = trigger.attr("data-addressbar") || url;
                        try {
                            this.onRedirected(title, addressBar);
                        } catch (error) {
                            addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                            history.pushState({}, title, addressBar);
                        }
                    }
                }

                if (addToHistory) {
                    if (window.isModal() && addToHistory) this.modalHelper.changeUrl(url);
                }

                this.formAction.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;

                this.formAction.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
                if (keepScroll) $(document).scrollTop(scrollTopBefore);
            },
            error: (response) => {
                if (this.requestCounter == requestCounter)
                    this.onRedirectionFailed(url, response);
            },
            complete: (response) => this.waiting.hide()
        });
        return false;
    }
}
