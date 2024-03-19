import Waiting from "olive/components/waiting";
import Url from "olive/components/url";
import ResponseProcessor from "olive/mvc/responseProcessor";
import { MainTagHelper } from "olive/components/mainTag";
import Services from "olive/di/services";
import OlivePage from "olive/olivePage";

export default class AjaxRedirect implements IService {
    private requestCounter = 0;
    public ajaxChangedUrl = 0;
    public isAjaxRedirecting = false;
    // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
    // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;

    constructor(
        protected url: Url,
        private responseProcessor: ResponseProcessor,
        private waiting: Waiting,
    ) { }

    public enableRedirect(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
    }

    protected onRedirected(trigger: JQuery, title: string, url: string) {
        if (this.onMainTagRedirected(trigger, url)) {
            return;
        }
        history.pushState({}, title, url);
    }

    protected onMainTagRedirected(trigger: JQuery, url: string): boolean {
        // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
        // we need to edit a query string parameter as _{main tag name without $}={url pathname}
        const mainTag = this.finalTargetAsMainTag(trigger)
        if (!mainTag) return false;
        (window.page as OlivePage).getService<MainTagHelper>(Services.MainTagHelper)
            .changeUrl(url, mainTag.attr("name").replace("$", ""));
        return true;
    }

    protected finalTargetAsMainTag(trigger: JQuery): JQuery | undefined {
        const mainTag = trigger.is("main[name^='$']") ? trigger : trigger.closest("main[name^='$']");
        return !!mainTag && !!mainTag.length ? mainTag : undefined;
    }

    protected onRedirectionFailed(trigger: JQuery, url: string, response: JQueryXHR) {
        if (response.status === 401) {
            this.url.goToUrlAfterLogin(this.url.current());
        } else if (confirm("Request failed. Do you want to see the error details?")) {
            open(url, "_blank");
        }
    }

    private redirect(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) { return true; }
        const link = $(event.currentTarget);
        let url = link.attr("href");

        const ajaxTarget = link.attr("ajax-target");
        const ajaxhref = link.attr("href");
        const ajaxUrl = link.attr("ajax-href");
        if (ajaxUrl != null && ajaxUrl != undefined)
            url = ajaxUrl;
        this.go(url, link, false, false, true, undefined, ajaxTarget, ajaxhref);
        return false;
    }

    public go(
        inputUrl: string,
        trigger: JQuery = null,
        isBack: boolean = false,
        keepScroll: boolean = false,
        addToHistory = true,
        onComplete?: (successful: boolean) => void,
        ajaxTarget?: string,
        ajaxhref?: string
    ): boolean {

        if (!trigger) { trigger = $(window); }

        var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");

        if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
            return;
        }

        isBack = isBack || trigger?.attr("data-back") === "true";
        let url = this.url.effectiveUrlProvider(inputUrl, trigger);

        if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
            url = url.substring(this.url.baseContentUrl.length).substring(3);
        }

        this.isAjaxRedirecting = true;
        // this.serverInvoker.isAwaitingAjaxResponse = true;

        const requestCounter = ++this.requestCounter;
        // if (window.stop) {
        //     window.stop();
        // } else if (document.execCommand !== undefined) {
        //     document.execCommand("Stop", false);
        // }

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }

        this.waiting.show(false, false);

        const mainTag = this.finalTargetAsMainTag(trigger);
        if (mainTag) {
            mainTag.removeClass("w3-semi-fade-in");
            mainTag.addClass("w3-semi-fade-out");
        }

        $.ajax({
            url,
            type: "GET",
            xhrFields: { withCredentials: true },
            success: (response) => {
                if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                    const documentUrl = document.URL;
                    const newUrl = trigger.attr("data-addressbar") || url;
                    var title = $(response).find("#page_meta_title").val();
                    if (title == undefined || title == null)
                        title = $("#page_meta_title").val();


                    const childaddress = document.URL.substring(documentUrl.indexOf("=") + 1);
                    const childaddresswithouthttp = document.URL.substring(documentUrl.indexOf("=") + 1).replace("https://", "").replace("http://", "");

                    const firstindex = childaddresswithouthttp.indexOf("/");
                    const secondindex = childaddresswithouthttp.indexOf("/", firstindex + 1);
                    const servicename = childaddresswithouthttp.substring(firstindex + 1, secondindex);

                    const extractedaddress = childaddress.replace("://hub", "://" + servicename).replace("/" + servicename + "/", "/");

                    if (addToHistory && newUrl.toLowerCase().contains(extractedaddress.substring(0, extractedaddress.indexOf("?")).toLowerCase())) {

                        const modifiedaddress = newUrl.substring(0, newUrl.indexOf("://") + 3) + newUrl.replace("://" + servicename.toLowerCase(), "://hub").replace("https://", "").replace("http://", "").replace("/", "/" + servicename + "/");
                        const newaddress = document.URL.substring(0, documentUrl.indexOf("=") + 1) + modifiedaddress;
                        this.onRedirected(trigger, title, newaddress);
                    }
                }
                else if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory && !window.isModal()) {
                        var title = $(response).find("#page_meta_title").val();
                        if (title == undefined || title == null)
                            title = $("#page_meta_title").val();

                        let addressBar = trigger.attr("data-addressbar") || url;
                        try {
                            this.onRedirected(trigger, title, addressBar);
                        } catch (error) {
                            addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                            this.onRedirected(trigger, title, addressBar);
                        }
                    }
                } else {
                    this.onMainTagRedirected(trigger, url);
                }

                // this.serverInvoker.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;

                this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null, ajaxTarget, ajaxhref);
                if (keepScroll) { $(document).scrollTop(scrollTopBefore); }

                if (onComplete) {
                    onComplete(true);
                }

            },
            error: (response) => {
                if (onComplete) {
                    onComplete(false);
                }
                if (this.requestCounter === requestCounter) {
                    this.onRedirectionFailed(trigger, url, response);
                }
            },
            complete: (response) => {
                this.waiting.hide();
                if (mainTag) {
                    mainTag.removeClass("w3-semi-fade-out");
                    mainTag.addClass("w3-semi-fade-in");
                }
            }
        });
        return false;
    }
}
