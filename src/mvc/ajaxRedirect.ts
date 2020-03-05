import Waiting from "olive/components/waiting";
import Url from "olive/components/url";
import ResponseProcessor from "olive/mvc/responseProcessor";

export default class AjaxRedirect implements IService {
    private requestCounter = 0;
    public ajaxChangedUrl = 0;
    public isAjaxRedirecting = false;
    // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
    // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;

    constructor(
        private url: Url,
        private responseProcessor: ResponseProcessor,
        private waiting: Waiting,
    ) { }

    public enableRedirect(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
    }

    protected onRedirected(title: string, url: string) {
        history.pushState({}, title, url);
    }

    protected onRedirectionFailed(url: string, response: JQueryXHR) {
        if (response.status === 401) {
            this.url.goToUrlAfterLogin(this.url.current());
        } else if (confirm("Request failed. Do you want to see the error details?")) {
            open(url, "_blank");
        }
    }

    private redirect(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) { return true; }
        const link = $(event.currentTarget);
        const url = link.attr("href");
        this.go(url, link, false, false, true);
        return false;
    }

    public go(
        url: string,
        trigger: JQuery = null,
        isBack: boolean = false,
        keepScroll: boolean = false,
        addToHistory = true,
        onComplete?: (successful: boolean) => void): boolean {

        if (!trigger) { trigger = $(window); }

        url = this.url.effectiveUrlProvider(url, trigger);

        if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
            url = url.substring(this.url.baseContentUrl.length).substring(3);
        }

        this.isAjaxRedirecting = true;
        // this.serverInvoker.isAwaitingAjaxResponse = true;

        const requestCounter = ++this.requestCounter;
        if (window.stop) {
            window.stop();
        } else if (document.execCommand !== undefined) {
            document.execCommand("Stop", false);
        }

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }

        this.waiting.show(false, false);

        $.ajax({
            url,
            type: "GET",
            xhrFields: { withCredentials: true },
            success: (response) => {
                // this.formAction.events_fa = {};

                if (onComplete) {
                    onComplete(true);
                }

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory && !window.isModal()) {

                        const title = $("#page_meta_title").val();

                        let addressBar = trigger.attr("data-addressbar") || url;
                        try {
                            this.onRedirected(title, addressBar);
                        } catch (error) {
                            addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                            history.pushState({}, title, addressBar);
                        }
                    }
                }

                // this.serverInvoker.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;

                this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
                if (keepScroll) { $(document).scrollTop(scrollTopBefore); }
            },
            error: (response) => {
                if (onComplete) {
                    onComplete(false);
                }
                if (this.requestCounter === requestCounter) {
                    this.onRedirectionFailed(url, response);
                }
            },
            complete: (response) => this.waiting.hide(),
        });
        return false;
    }
}
