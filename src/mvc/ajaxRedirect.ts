import Waiting from "olive/components/waiting";
import Url from "olive/components/url";
import ResponseProcessor from "olive/mvc/responseProcessor";
import { MainTagHelper } from "olive/components/mainTag";
import Services from "olive/di/services";
import OlivePage from "olive/olivePage";
import LiteEvent from "olive/components/liteEvent";

interface IPendingRedirect {
    id: number;
    xhr: JQueryXHR;
    aborted: boolean;
    // The main tag this response will land in, kept so a navigation can cancel anything
    // still loading into a region nested inside its own target.
    target: JQuery;
}

export default class AjaxRedirect implements IService {
    private requestCounter = 0;
    private targetKeySeed = 0;

    // The navigation currently in flight for each target region. Starting a new navigation
    // to the same region aborts the previous one, so the latest click wins no matter which
    // response comes back first.
    private inFlight: { [key: string]: IPendingRedirect } = {};

    public ajaxChangedUrl = 0;
    public isAjaxRedirecting = false;
    // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
    // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;

    public beforeRedirect = new LiteEvent<IEventArgs>();

    constructor(
        protected url: Url,
        private responseProcessor: ResponseProcessor,
        private waiting: Waiting,
    ) { }

    public enableRedirect(selector: JQuery) {
        selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
    }

    protected onRedirected(trigger: JQuery, title: string, url: string) {
        if (this.onMainTagRedirected(trigger, title, url)) {
            return;
        }
        history.pushState({}, title, url);
    }

    // The window title alone, for a navigation that leaves the address bar where it is.
    // onRedirected sets the title as part of pushing the new address, so this is only for the
    // case where there is no address to push and the title would otherwise be dropped.
    protected onTitleChanged(title: string, url: string) {
        if (title) document.title = title;
    }

    protected onMainTagRedirected(trigger: JQuery, title: string, url: string): boolean {
        // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
        // we need to edit a query string parameter as _{main tag name without $}={url pathname}
        const mainTag = this.finalTargetAsMainTag(trigger)
        if (!this.isInternalMainTag(mainTag)) return false;
        (window.page as OlivePage).getService<MainTagHelper>(Services.MainTagHelper)
            .changeUrl(url, mainTag.attr("name").replace("$", ""), title);
        return true;
    }

    protected isInternalMainTag(mainTag: JQuery) {
        if (!mainTag || !mainTag.length) return false;
        const name = mainTag.attr('name');
        if (!name || name.length < 1) return false;
        return name[0] == "$";
    }

    protected finalTargetAsMainTag(trigger: JQuery): JQuery | undefined {
        let mainTag = trigger.is("main") ? trigger : trigger.closest("main");
        if (!!mainTag && !!mainTag.length) return mainTag;
        mainTag = $("main:first");
        if (!!mainTag && !!mainTag.length) return mainTag;
        return undefined;
    }

    // Identifies the region a request will replace, so two navigations aimed at the same
    // region can supersede each other while independent regions still load in parallel.
    // It is derived from the same element the request stamps its version onto.
    private targetKeyFor(target: JQuery | undefined): string {
        if (!target || !target.length) return "page";

        // Some callers pass a multi element set. Settling on the first keeps the key, the
        // version stamp and the presence check all pointing at one element.
        const mainTag = target.first();

        const name = mainTag.attr("name");
        if (name) return "main:" + name;

        // An unnamed main - the ordinary page, and every ajax modal shell - gets a generated
        // key. It lives in a data- attribute so it survives the swap in responseProcessor,
        // which copies every data-* attribute from the old main onto the new one.
        let key = mainTag.attr("data-nav-key");
        if (!key) {
            key = "nav-" + (++this.targetKeySeed);
            mainTag.attr("data-nav-key", key);
        }
        return key;
    }

    private targetStillPresent(mainTag: JQuery, key: string): boolean {
        const name = mainTag.first().attr("name");
        if (name) return $("main[name='" + name + "']").length > 0;
        return $("main[data-nav-key='" + key + "']").length > 0;
    }

    private isCurrent(key: string, id: number): boolean {
        const pending = this.inFlight[key];
        return !!pending && pending.id === id;
    }

    private abortPending(key: string): void {
        const pending = this.inFlight[key];
        if (!pending) return;

        // Drop the registration before aborting: abort() runs the error and complete
        // handlers synchronously, and they must see this request as no longer current.
        delete this.inFlight[key];
        pending.aborted = true;
        if (pending.xhr) pending.xhr.abort();
    }

    // A navigation replaces everything inside its target, so any request still loading into
    // a nested region is aimed at an element that is about to be discarded. Cancel those too,
    // otherwise a child region's late response lands in the page that replaced it.
    private abortContainedBy(container: JQuery | undefined): void {
        if (!container || !container.length) return;

        const parent = container[0];

        // Collect first: aborting runs handlers synchronously, which mutates the registry.
        const nested = Object.keys(this.inFlight).filter(k => {
            const target = this.inFlight[k].target;
            if (!target || !target.length) return false;
            return target[0] !== parent && parent.contains(target[0]);
        });

        nested.forEach(k => this.abortPending(k));
    }

    // Drops the navigation in flight for the region the trigger points at. Use it when
    // moving away from that region by some other means, such as swapping in an iframe.
    public cancelPending(trigger: JQuery = null): void {
        if (!trigger) trigger = $(window);
        this.abortPending(this.targetKeyFor(this.finalTargetAsMainTag(trigger)));
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
        this.beforeRedirect.raise({})
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

        if (!trigger) trigger = $(window);

        var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");

        if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
            return;
        }

        isBack = isBack || trigger?.attr("data-back") === "true";
        let url = this.url.effectiveUrlProvider(inputUrl, trigger);

        if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
            url = url.substring(this.url.baseContentUrl.length).substring(3);
        }

        const mainTag = this.finalTargetAsMainTag(trigger);

        // An ajax target names the main tag the response actually lands in, which is not
        // always the one enclosing the trigger. Key on it so requests only supersede others
        // aimed at the same region.
        const targetMain = ajaxTarget ? $("main[name='" + ajaxTarget + "']") : mainTag;
        const key = ajaxTarget ? "main:" + ajaxTarget : this.targetKeyFor(mainTag);

        // This click supersedes whatever was still loading into the same region, and into
        // every region nested inside it.
        this.abortPending(key);
        this.abortContainedBy(targetMain);

        this.isAjaxRedirecting = true;
        // this.serverInvoker.isAwaitingAjaxResponse = true;

        const requestId = ++this.requestCounter;

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }

        const waitToken = this.waiting.show(false, false);

        let version = undefined;
        if (mainTag) {
            mainTag.removeClass("w3-semi-fade-in");
            mainTag.addClass("w3-semi-fade-out");

            version = this.uuidv4();
            mainTag.attr("data-version", version)
        }

        const pending: IPendingRedirect = { id: requestId, xhr: null, aborted: false, target: targetMain };
        this.inFlight[key] = pending;

        pending.xhr = $.ajax({
            url,
            type: "GET",
            xhrFields: { withCredentials: true },
            success: (response) => {
                // A newer navigation to the same region has taken over. Nothing here may run:
                // not the history push, not the back-button counter, not the content swap.
                if (!this.isCurrent(key, requestId)) {
                    return;
                }

                if (version && mainTag) {
                    if (mainTag.attr("data-version") != version) {
                        console.log("Version mismatch, aborting.");
                        return;
                    }
                    if (!document.contains(mainTag[0]) && !this.targetStillPresent(mainTag, key)) {
                        console.log("Main tag no longer in document, aborting.");
                        return;
                    }
                }

                var title = $(response).find("#page_meta_title").val();
                if (title == undefined || title == null)
                    title = $("#page_meta_title").val();

                if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                    const documentUrl = document.URL;
                    const newUrl = trigger.attr("data-addressbar") || url;


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
                    if (!window.isModal()) {
                        if (addToHistory) {
                            let addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                this.onRedirected(trigger, title, addressBar);
                            } catch (error) {
                                addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                                this.onRedirected(trigger, title, addressBar);
                            }
                        }
                        else {
                            // The address bar already names this page: this is the ajax load that fills
                            // a page in with its own content, not a move to somewhere else. Nothing is
                            // pushed, but the title still has to be taken from the response, or the page
                            // keeps whatever the surrounding shell was rendered with until the next
                            // navigation replaces it.
                            this.onTitleChanged(title, url);
                        }
                    }
                } else {
                    this.onMainTagRedirected(trigger, title, url);
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
                // We cancelled this one ourselves because the user moved on. Staying silent
                // keeps the error view and the address bar tied to the request they chose.
                if (pending.aborted) { return; }
                if (!this.isCurrent(key, requestId)) { return; }

                if (onComplete) {
                    onComplete(false);
                }

                this.onRedirectionFailed(trigger, url, response);
            },
            complete: (response) => {
                // Release this request's hold on the spinner. It stays up while any other
                // navigation is still running.
                this.waiting.hide(waitToken);

                if (!this.isCurrent(key, requestId)) { return; }
                delete this.inFlight[key];

                if (mainTag) {
                    mainTag.removeClass("w3-semi-fade-out");
                    mainTag.addClass("w3-semi-fade-in");
                }
            }
        });
        return false;
    }

    private uuidv4 = () => {
        return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            // tslint:disable-next-line: no-bitwise
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
