import Url from "olive/components/url";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import ResponseProcessor from "olive/mvc/responseProcessor";

interface StateData {
    url: string;
    foundQs: string[]
}

export class MainTagHelper implements IService {
    private state?: StateData | undefined = undefined;

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
        this.ajaxRedirect.beforeRedirect.handle((e) => {
            this.resetState();
        })
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
        var tags = $("main[name^='$'][data-default-url]");

        // at least one content loaded
        let result = false;

        for (let i = 0; i < tags.length; i++) {
            const main = $(tags[i]);
            const mainTagName = main.attr("name").substring(1);
            if (this.state.foundQs.indexOf(mainTagName) !== -1)
                continue;
            const url = main.attr("data-default-url");
            main.attr("data-default-url", undefined);
            if (url && this.openWithUrl(mainTagName, url)) {
                this.state.foundQs.push(mainTagName);
                result = true;
            }
        }
        return result;
    }

    public changeUrl(url: string, mainTagName: string, title?: string) {
        this.validateState()

        mainTagName = mainTagName.replace("$", "");
        let currentPath: string = this.url.removeQuery(this.url.current(), "_" + mainTagName);

        var children = $("main[name='$" + mainTagName + "']").attr("data-children");
        if (children) {
            children.split(",").forEach(child => {
                if (child.startsWith("$")) {
                    child = child.substring(1);
                }
                currentPath = this.url.removeQuery(currentPath, "_" + child);
                this.state.foundQs = this.state.foundQs.filter(item => item !== child)
            })
        }

        if (currentPath.endsWith("?")) {
            currentPath = currentPath.trimEnd("?");
        }

        let mainTagUrl: string = this.url.addQuery(currentPath, "_" + mainTagName, this.url.encodeGzipUrl(url));
        history.pushState({}, title, mainTagUrl);
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

    private validateState = () => {
        if (!this.state || this.state.url != window.location.pathname) {
            this.state = { url: window.location.pathname, foundQs: [] }
        }
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

        helper.invalidateChildren(element);
        element.html('');
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

                var title = this.element.find("#page_meta_title").val();
                if (title == undefined || title == null)
                    title = $("#page_meta_title").val();

                if (changeUrl && !skipUrlParameter) {
                    this.helper.changeUrl(this.url, this.mainTagName, title)
                } else {
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
