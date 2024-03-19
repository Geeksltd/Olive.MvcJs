define(["require", "exports", "olive/di/services"], function (require, exports, services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AjaxRedirect {
        // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
        // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;
        constructor(url, responseProcessor, waiting) {
            this.url = url;
            this.responseProcessor = responseProcessor;
            this.waiting = waiting;
            this.requestCounter = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
        }
        enableRedirect(selector) {
            selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
        }
        onRedirected(trigger, title, url) {
            if (this.onMainTagRedirected(trigger, url)) {
                return;
            }
            history.pushState({}, title, url);
        }
        onMainTagRedirected(trigger, url) {
            // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
            // we need to edit a query string parameter as _{main tag name without $}={url pathname}
            const mainTag = this.finalTargetAsMainTag(trigger);
            if (!mainTag)
                return false;
            window.page.getService(services_1.default.MainTagHelper)
                .changeUrl(url, mainTag.attr("name").replace("$", ""));
            return true;
        }
        finalTargetAsMainTag(trigger) {
            const mainTag = trigger.is("main[name^='$']") ? trigger : trigger.closest("main[name^='$']");
            return !!mainTag && !!mainTag.length ? mainTag : undefined;
        }
        onRedirectionFailed(trigger, url, response) {
            if (response.status === 401) {
                this.url.goToUrlAfterLogin(this.url.current());
            }
            else if (confirm("Request failed. Do you want to see the error details?")) {
                open(url, "_blank");
            }
        }
        redirect(event) {
            if (event.ctrlKey || event.button === 1) {
                return true;
            }
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
        go(inputUrl, trigger = null, isBack = false, keepScroll = false, addToHistory = true, onComplete, ajaxTarget, ajaxhref) {
            if (!trigger) {
                trigger = $(window);
            }
            var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");
            if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
                return;
            }
            isBack = isBack || (trigger === null || trigger === void 0 ? void 0 : trigger.attr("data-back")) === "true";
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
                            }
                            catch (error) {
                                addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                                this.onRedirected(trigger, title, addressBar);
                            }
                        }
                    }
                    else {
                        this.onMainTagRedirected(trigger, url);
                    }
                    // this.serverInvoker.isAwaitingAjaxResponse = false;
                    this.isAjaxRedirecting = false;
                    this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null, ajaxTarget, ajaxhref);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
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
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsTUFBcUIsWUFBWTtRQUk3QiwwRkFBMEY7UUFDMUYsOEdBQThHO1FBRTlHLFlBQ2MsR0FBUSxFQUNWLGlCQUFvQyxFQUNwQyxPQUFnQjtZQUZkLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDVixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFUcEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDcEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDbkIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBUTdCLENBQUM7UUFFRSxjQUFjLENBQUMsUUFBZ0I7WUFDbEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFUyxZQUFZLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxHQUFXO1lBQzlELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN6QyxPQUFPO1lBQ1gsQ0FBQztZQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRVMsbUJBQW1CLENBQUMsT0FBZSxFQUFFLEdBQVc7WUFDdEQscUdBQXFHO1lBQ3JHLHdGQUF3RjtZQUN4RixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDbEQsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFD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