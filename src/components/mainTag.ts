import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";
import LiteEvent from "olive/components/liteEvent";

interface StateData {
    url: string;
    foundQs: string[]
}

export interface IMainTagUrlChangedEventArgs {
    mainTagName: string;
    url: string;
    encodedUrl: string;
    addedToUrl: boolean;
}

export class MainTagHelper implements IService {
    private state?: StateData | undefined = undefined;
    public onUrlChanged = new LiteEvent<IMainTagUrlChangedEventArgs>();

    constructor(
        private url: Url,
        private ajaxRedirect: AjaxRedirect,
        private responseProcessor: ResponseProcessor,
    ) { }

    public enableLink(selector: JQuery) {
        selector.off("click").on("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.render(e);
            return false;
        });
    }

    public initialize() {
        this.responseProcessor.processCompleted.handle((e) => {
            this.tryOpenFromUrl();
        });
    }

    public resetState(): void {
        this.state = undefined;
    }

    public tryOpenFromUrl(): void {
        this.validateState()
        this.tryOpenFromUrlInternal();
        this.tryOpenDefaultUrl();
    }

    private tryOpenFromUrlInternal(): boolean {
        var reserved = ["_modal", "_nav"];

        // at least one content loaded
        let result = false;

        new URLSearchParams(window.location.search).forEach((value, key) => {
            if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                const mainTagName = key.substring(1);
                if (this.state.foundQs.indexOf(mainTagName) !== -1)
                    return;

                if (this.openWithUrl(mainTagName)) {
                    this.state.foundQs.push(mainTagName);
                    result = true;
                }
            }
        });
        return result;
    }

    private tryOpenDefaultUrl(): boolean {
        var tags = $("main[name^='$'][data-default-url], main[name^='$'][data-current-url]");

        // at least one content loaded
        let result = false;

        for (let i = 0; i < tags.length; i++) {
            const main = $(tags[i]);
            const mainTagName = main.attr("name").substring(1);
            if (this.state.foundQs.indexOf(mainTagName) !== -1)
                continue;

            // Already rendered (server pre-rendered its content, or a previous load filled it):
            // do NOT re-fetch it - that causes duplicate/triple AJAX of the same url. Just track
            // it as found so subsequent passes skip it too.
            if (main.html().trim() !== "") {
                this.state.foundQs.push(mainTagName);
                continue;
            }

            // Empty tag: load its content. data-default-url is an immutable, server-rendered
            // fallback and is never removed; data-current-url (set synchronously in the MainTag
            // constructor and preserved across content swaps) takes priority when present.
            const url = main.attr("data-current-url") || main.attr("data-default-url");
            if (url && this.openWithUrl(mainTagName, url)) {
                this.state.foundQs.push(mainTagName);
                result = true;
            }
        }
        return result;
    }

    public removeFromUrl(mainTagName: string) {
        mainTagName = mainTagName.replace("$", "");
        let currentPath: string = this.url.removeQuery(this.url.current(), "_" + mainTagName);

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        if (currentPath !== this.url.current()) {
            history.replaceState({}, document.title, currentPath);
        }
    }

    public changeUrl(url: string, mainTagName: string, title?: string) {
        this.validateState()

        mainTagName = mainTagName.replace("$", "");
        const element = $("main[name='$" + mainTagName + "']");
        element.attr('data-current-url', url);

        const encodedUrl = this.url.encodeGzipUrl(url);
        const skipUrlParameter = element.attr("data-change-url") === "false";
        if (skipUrlParameter) {
            this.removeFromUrl(mainTagName);
            this.onUrlChanged.raise({ mainTagName, url, encodedUrl, addedToUrl: false });
            return;
        }

        let currentPath: string = this.url.removeQuery(this.url.current(), "_" + mainTagName);

        var children = element.attr("data-children");
        if (children) {
            children.split(",").forEach(child => {
                if (child.startsWith("$")) {
                    child = child.substring(1);
                }
                currentPath = this.url.removeQuery(currentPath, "_" + child);
                this.state.foundQs = this.state.foundQs.filter(item => item !== child)
                // Clear stale child content so tryOpenDefaultUrl re-fetches it (it skips tags
                // that still have content). Required for the data-redirect=ajax navigation path,
                // where no MainTag is constructed so invalidateChildren() never runs - changeUrl
                // is the only children hook there, and it runs before processCompleted so this
                // produces exactly one reload. Only clear when the child has a reload source.
                const childEl = $("main[name='$" + child + "']");
                if (childEl.attr("data-current-url") || childEl.attr("data-default-url"))
                    childEl.html('');
            })
        }

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        let mainTagUrl: string = this.url.addQuery(currentPath, "_" + mainTagName, encodedUrl);
        history.pushState({}, title, mainTagUrl);
        this.onUrlChanged.raise({ mainTagName, url, encodedUrl, addedToUrl: true });
    }

    public invalidateChildren(mainTagElement: JQuery) {
        const childrenStr = mainTagElement.attr("data-children");
        if (!childrenStr || !childrenStr.length) return;

        const children = childrenStr.split(",").filter(a => a && a.length);
        if (!children || !children.length) return;

        children.forEach(child => {
            if (child.startsWith("$")) {
                child = child.substring(1);
            }
            this.state.foundQs = this.state.foundQs.filter(item => item !== child);
            // Clear the child's stale content so tryOpenDefaultUrl re-fetches it (it skips tags
            // that still have content). Only clear when the child has a reload source, otherwise
            // an empty tag with no data-current-url/data-default-url could never be reloaded.
            const childEl = $("main[name='$" + child + "']");
            if (childEl.attr("data-current-url") || childEl.attr("data-default-url"))
                childEl.html('');
        })
    }

    public render(event?: JQueryEventObject, url?: string) {
        this.validateState()
        const target = $(event.currentTarget);
        const mainTagUrl = url ? url : target.attr("href");
        const mainTagName = target.attr("target").replace("$", "");
        const element = $("main[name='$" + mainTagName + "']");
        if (!mainTagUrl || !element || !element.length) return false;
        if (this.state.foundQs.indexOf(mainTagName) === -1)
            this.state.foundQs.push(mainTagName);
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, target).render();
    }

    public openWithUrl(mainTagName: string, url?: string): boolean {
        this.validateState()
        mainTagName = mainTagName.replace("$", "");
        const mainTagUrl = url ? url : this.url.getQuery("_" + mainTagName);
        const element = $("main[name='$" + mainTagName + "']");
        if (!mainTagUrl || !element || !element.length) return false;
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
        return true;
    }

    public reload(mainTagName: string): boolean {
        this.validateState();
        mainTagName = mainTagName.replace("$", "");
        const element = $("main[name='$" + mainTagName + "']");
        if (!element || !element.length) return false;

        // Priority: 1. query string (gzipped), 2. data-current-url, 3. data-default-url
        const qsUrlEncoded = this.url.getQuery("_" + mainTagName);
        const qsUrl = qsUrlEncoded ? this.url.decodeGzipUrl(qsUrlEncoded) : null;
        const currentUrl = element.attr("data-current-url");
        const defaultUrl = element.attr("data-default-url");
        const mainTagUrl = qsUrl || currentUrl || defaultUrl;

        if (!mainTagUrl) return false;

        this.state.foundQs = this.state.foundQs.filter(item => item !== mainTagName);
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
        this.state.foundQs.push(mainTagName);
        return true;
    }

    private validateState = () => {
        if (!this.state || this.state.url != window.location.pathname) {
            this.state = { url: window.location.pathname, foundQs: [] };
            return;
        }

        // Uniform rule for static and normal tags. Keep a tag if it has content, OR if it has
        // a data-current-url (it has already been loaded, or a load is in flight - the
        // constructor sets data-current-url synchronously). Only drop a genuinely fresh, empty
        // tag (e.g. one that just arrived from a full-page ajax reload, which carries no
        // data-current-url) so tryOpenDefaultUrl can re-seed it from data-default-url.
        // Keeping in-flight tags here prevents duplicate concurrent loads of the same url.
        this.state.foundQs = this.state.foundQs.filter(name => {
            const el = document.querySelector(`main[name='$${name}']`);
            if (!el) return false;                          // gone from DOM -> drop
            if (el.innerHTML.trim() !== "") return true;    // has content -> keep
            if (el.getAttribute("data-current-url")) return true; // loaded / in-flight -> keep
            return false;                                   // fresh & empty -> drop so it can re-seed
        });
    }
}

export default class MainTag {
    private url: string;

    constructor(
        private urlService: Url,
        private ajaxRedirect: AjaxRedirect,
        private helper: MainTagHelper,
        baseUrl: string,
        private element: JQuery,
        private mainTagName: string,
        private trigger: JQuery) {

        baseUrl = this.urlService.decodeGzipUrl(baseUrl);
        if (this.isValidUrl(baseUrl)) {
            this.url = this.urlService.makeRelative(decodeURIComponent(baseUrl));
            // persist the reload source synchronously, so reload() can always find it
            // even if the async render callback never runs (version mismatch / abort)
            element.attr('data-current-url', this.url);
        }

        helper.invalidateChildren(element);
        // Don't clear content eagerly: the swap happens atomically in responseProcessor via
        // oldMain.replaceWith(newMain) on success. Clearing here would leave the tag blank if
        // the request is later aborted (version mismatch / tag left document).
    }

    public render(changeUrl: boolean = true) {
        if (!this.url) return;
        const back = this.trigger?.attr("data-back") === "true";
        const skipUrlParameter = this.element.attr("data-change-url") === "false";
        this.ajaxRedirect.go(this.url,
            this.element,
            back,
            false,
            false,
            (success: Boolean) => {
                if (!success) return;

                // Always update data-current-url with the loaded URL
                this.element.attr('data-current-url', this.url);

                var title = this.element.find("#page_meta_title").val();
                if (title == undefined || title == null)
                    title = $("#page_meta_title").val();

                if (changeUrl && !skipUrlParameter) {
                    this.helper.changeUrl(this.url, this.mainTagName, title)
                } else {
                    if (skipUrlParameter) {
                        this.helper.removeFromUrl(this.mainTagName);
                    }
                    document.title = title;
                }
            });
    }

    protected isValidUrl(mainTagUrl: string): boolean {

        // Prevent XSS
        if (mainTagUrl.contains("javascript:")) {
            console.error("Dangerous script detected!!! Request is now aborted!");
            return false;
        }

        // Prevent Open Redirection
        if (mainTagUrl.indexOf("http://") === 0 || mainTagUrl.indexOf("https://") === 0) {

            let newHostName = new URL(mainTagUrl).hostname;
            let currentHostName = new URL(this.urlService.current()).hostname;

            if (newHostName !== currentHostName) {
                console.error("Dangerous destination detected!!! Request is now aborted!");
                return false;
            }
        }
        return true;
    }
}
