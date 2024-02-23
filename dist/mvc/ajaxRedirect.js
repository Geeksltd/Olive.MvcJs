define(["require", "exports"], function (require, exports) {
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
            // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
            // we need to edit a query string parameter as _{main tag name without $}={url pathname}
            const mainTag = trigger.is("main[name^='$']") ? trigger : trigger.closest("main[name^='$']");
            if (mainTag && mainTag.length) {
                url = this.url.updateQuery(this.url.current(), mainTag.attr("name").replace("$", "_"), encodeURIComponent(url));
                history.pushState({}, title, url);
                return;
            }
            history.pushState({}, title, url);
        }
        onRedirectionFailed(url, response) {
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
                        this.onRedirectionFailed(url, response);
                    }
                },
                complete: (response) => this.waiting.hide(),
            });
            return false;
        }
    }
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBSUEsTUFBcUIsWUFBWTtRQUk3QiwwRkFBMEY7UUFDMUYsOEdBQThHO1FBRTlHLFlBQ2MsR0FBUSxFQUNWLGlCQUFvQyxFQUNwQyxPQUFnQjtZQUZkLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDVixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ3BDLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFUcEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDcEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7WUFDbkIsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBUTdCLENBQUM7UUFFRSxjQUFjLENBQUMsUUFBZ0I7WUFDbEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFUyxZQUFZLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxHQUFXO1lBQzlELHFHQUFxRztZQUNyRyx3RkFBd0Y7WUFDeEYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUM1RixJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzVCLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FB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