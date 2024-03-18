import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";

interface UrlData {
    url: string;
    foundQs: string[]
}

export class MainTagHelper implements IService {
    public data: UrlData | undefined = undefined;

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
            if (this.data) {
                if (this.data.url != window.location.pathname) {
                    this.data = undefined;
                } else {
                    this.tryOpenDefaultUrl();
                    return;
                }
            }
            this.tryOpenFromUrl();
        });
    }

    public tryOpenFromUrl() {
        if (!this.data) {
            this.data = { url: window.location.pathname, foundQs: [] }
        }

        var reserved = ["_modal", "_nav"];

        new URLSearchParams(window.location.search).forEach((value, key) => {
            if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                const mainTagName = key.substring(1);
                if (this.data.foundQs.indexOf(mainTagName) !== -1)
                    return;

                if (this.openWithUrl(mainTagName))
                    this.data.foundQs.push(mainTagName);
            }
        });
    }

    public tryOpenDefaultUrl() {
        var tags = $("main[name^='$'][data-default-url]");
        for (let i = 0; i < tags.length; i++) {
            const main = $(tags[i]);
            const mainTagName = main.attr("name").substring(1);
            if (this.data.foundQs.indexOf(mainTagName) !== -1)
                continue;
            const url = main.attr("data-default-url");
            main.attr("data-default-url", undefined);
            if (url && this.openWithUrl(mainTagName, url))
                this.data.foundQs.push(mainTagName);
        }
    }

    public changeUrl(url: string, mainTagName: string) {
        let currentPath: string = this.url.removeQuery(this.url.current(), "_" + mainTagName);

        var children = $("main[name='$" + mainTagName + "']").attr("data-children");
        if (children) {
            children.split(",").forEach(child => {
                if (child.startsWith("$")) {
                    child = child.substring(1);
                }
                currentPath = this.url.removeQuery(currentPath, "_" + child);
                this.data.foundQs = this.data.foundQs.filter(item => item !== child)
            })
        }

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        let mainTagUrl: string = this.url.addQuery(currentPath, "_" + mainTagName, this.url.encodeGzipUrl(url));
        history.pushState({}, "", mainTagUrl);
    }

    public render(event?: JQueryEventObject, url?: string) {
        const target = $(event.currentTarget);
        const mainTagUrl = url ? url : target.attr("href");
        const mainTagName = target.attr("target").replace("$", "");
        const element = $("main[name='$" + mainTagName + "']");
        if (!mainTagUrl || !element || !element.length) return false;
        this.data.foundQs = this.data.foundQs.filter(item => item !== mainTagName)
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, target).render();
    }

    protected openWithUrl(mainTagName: string, url?: string): boolean {
        const mainTagUrl = url ? url : this.url.getQuery("_" + mainTagName);
        const element = $("main[name='$" + mainTagName + "']");
        if (!mainTagUrl || !element || !element.length) return false;
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
        return true;
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
        }
    }

    public onComplete(success: Boolean) {
        // if (success) {
        //     this.helper.tryOpenFromUrl();
        //     this.helper.tryOpenDefaultUrl();
        // }
    }

    public render(changeUrl: boolean = true) {
        if (!this.url) return;
        const back = this.trigger?.attr("data-back") === "true";
        this.ajaxRedirect.go(this.url,
            this.element,
            back,
            false,
            false,
            (success: Boolean) => {
                if (changeUrl) {
                    this.helper.changeUrl(this.url, this.mainTagName)
                }
                this.onComplete(success);
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
