define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainTagHelper = void 0;
    class MainTagHelper {
        constructor(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.state = undefined;
            this.validateState = () => {
                if (!this.state || this.state.url != window.location.pathname) {
                    this.state = { url: window.location.pathname, foundQs: [] };
                }
            };
        }
        enableLink(selector) {
            selector.off("click").on("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.render(e);
                return false;
            });
        }
        initialize() {
            this.responseProcessor.processCompleted.handle((e) => {
                if (!this.tryOpenFromUrl()) {
                    this.tryOpenDefaultUrl();
                }
            });
        }
        tryOpenFromUrl() {
            this.validateState();
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
        tryOpenDefaultUrl() {
            this.validateState();
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
        changeUrl(url, mainTagName) {
            this.validateState();
            let currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            var children = $("main[name='$" + mainTagName + "']").attr("data-children");
            if (children) {
                children.split(",").forEach(child => {
                    if (child.startsWith("$")) {
                        child = child.substring(1);
                    }
                    currentPath = this.url.removeQuery(currentPath, "_" + child);
                    this.state.foundQs = this.state.foundQs.filter(item => item !== child);
                });
            }
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            let mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, this.url.encodeGzipUrl(url));
            history.pushState({}, "", mainTagUrl);
        }
        render(event, url) {
            this.validateState();
            const target = $(event.currentTarget);
            const mainTagUrl = url ? url : target.attr("href");
            const mainTagName = target.attr("target").replace("$", "");
            const element = $("main[name='$" + mainTagName + "']");
            if (!mainTagUrl || !element || !element.length)
                return false;
            if (this.state.foundQs.indexOf(mainTagName) === -1)
                this.state.foundQs.push(mainTagName);
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, target).render();
        }
        openWithUrl(mainTagName, url) {
            this.validateState();
            const mainTagUrl = url ? url : this.url.getQuery("_" + mainTagName);
            const element = $("main[name='$" + mainTagName + "']");
            if (!mainTagUrl || !element || !element.length)
                return false;
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
            return true;
        }
    }
    exports.MainTagHelper = MainTagHelper;
    class MainTag {
        constructor(urlService, ajaxRedirect, helper, baseUrl, element, mainTagName, trigger) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.element = element;
            this.mainTagName = mainTagName;
            this.trigger = trigger;
            baseUrl = this.urlService.decodeGzipUrl(baseUrl);
            if (this.isValidUrl(baseUrl)) {
                this.url = this.urlService.makeRelative(decodeURIComponent(baseUrl));
            }
        }
        render(changeUrl = true) {
            var _a;
            if (!this.url)
                return;
            const back = ((_a = this.trigger) === null || _a === void 0 ? void 0 : _a.attr("data-back")) === "true";
            this.ajaxRedirect.go(this.url, this.element, back, false, false, (success) => {
                if (success && changeUrl) {
                    this.helper.changeUrl(this.url, this.mainTagName);
                }
            });
        }
        isValidUrl(mainTagUrl) {
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
    exports.default = MainTag;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQVNBLE1BQWEsYUFBYTtRQUd0QixZQUNZLEdBQVEsRUFDUixZQUEwQixFQUMxQixpQkFBb0M7WUFGcEMsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFMekMsVUFBSyxHQUEyQixTQUFTLENBQUM7WUFtSHpDLGtCQUFhLEdBQUcsR0FBRyxFQUFFO2dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUM1RCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQTtnQkFDL0QsQ0FBQztZQUNMLENBQUMsQ0FBQTtRQWpIRyxDQUFDO1FBRUUsVUFBVSxDQUFDLFFBQWdCO1lBQzlCLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sVUFBVTtZQUNiLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFN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