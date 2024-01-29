import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";

interface UrlData {
    url: string;
    status: string
}

export class MainTagHelper implements IService {
    public data: { [key: string]: UrlData } = {};

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
        this.data = {};
        this.responseProcessor.processCompleted.handle(() => this.tryOpenFromUrl());
    }

    public tryOpenFromUrl() {
        var reserved = ["_modal", "_nav", "_returnUrl"];
        new URLSearchParams(window.location.search).forEach((value, key) => {
            if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                this.openWithUrl(key.substring(1));
            }
        });
    }

    public changeUrl(url: string, mainTagName: string) {

        let currentPath: string = this.url.removeQuery(this.url.current(), "_" + mainTagName);

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        // if (this.url.isAbsolute(url)) {
        //     const pathArray: string[] = url.split("/").splice(3);
        //     url = pathArray.join("/");
        // }

        let mainTagUrl: string = this.url.addQuery(currentPath, "_" + mainTagName, encodeURIComponent(url));

        history.pushState({}, "", mainTagUrl);
    }

    public render(event?: JQueryEventObject, url?: string) {
        const target = $(event.currentTarget);
        let mainTagUrl = url ? url : target.attr("href");
        let mainTagName = target.attr("target").replace("$", "");
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName).render();
    }

    protected openWithUrl(mainTagName: string): void {

        let mainTagUrl = this.url.getQuery("_" + mainTagName).toLowerCase();
        new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName).render(false);
    }
}

export default class MainTag {
    private element: JQuery;

    constructor(
        private urlService: Url,
        private ajaxRedirect: AjaxRedirect,
        private helper: MainTagHelper,
        private url: string,
        private mainTagName: string) {

        this.element = $("main[name='$" + this.mainTagName + "']");
    }

    public onComplete(success: Boolean) {
        this.helper.data[this.mainTagName].status = success ? "loaded" : "failed";
    }

    public render(changeUrl: boolean = true) {

        if (!this.element || !this.element.length || !this.url || !this.isValidUrl(this.url)) {
            return;
        }

        this.url = this.urlService.effectiveUrlProvider(this.url, null);

        const urlData = this.helper.data[this.mainTagName];
        if (urlData) {
            if (urlData.url === this.url &&
                (urlData.status === "loading" ||
                    urlData.status === "loaded")) {
                return;
            }
        } else {
            this.helper.data[this.mainTagName] = {} as UrlData;
        }

        console.log(this.url, this.mainTagName)

        this.helper.data[this.mainTagName].url = this.url;
        this.helper.data[this.mainTagName].status = "loading";

        this.ajaxRedirect.go(this.url,
            this.element,
            false,
            false,
            false,
            (success: Boolean) => {
                this.onComplete(success);
                if (changeUrl)
                    this.helper.changeUrl(this.url, this.mainTagName);
            });
    }

    protected isValidUrl(mainTagUrl: string): boolean {

        // Prevent XSS
        if (mainTagUrl.contains("javascript:")) {
            alert("Dangerous script detected!!! Request is now aborted!");
            return false;
        }

        // Prevent Open Redirection
        if (mainTagUrl.indexOf("http://") === 0 || mainTagUrl.indexOf("https://") === 0) {

            let newHostName = new URL(mainTagUrl).hostname;
            let currentHostName = new URL(this.urlService.current()).hostname;

            if (newHostName !== currentHostName) {
                alert("Dangerous script detected!!! Request is now aborted!");
                return false;
            }
        }
        return true;
    }
}
