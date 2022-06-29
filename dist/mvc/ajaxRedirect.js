define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AjaxRedirect = /** @class */ (function () {
        // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
        // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;
        function AjaxRedirect(url, responseProcessor, waiting) {
            this.url = url;
            this.responseProcessor = responseProcessor;
            this.waiting = waiting;
            this.requestCounter = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
        }
        AjaxRedirect.prototype.enableRedirect = function (selector) {
            var _this = this;
            selector.off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return _this.redirect(e); });
        };
        AjaxRedirect.prototype.onRedirected = function (title, url) {
            history.pushState({}, title, url);
        };
        AjaxRedirect.prototype.onRedirectionFailed = function (url, response) {
            if (response.status === 401) {
                this.url.goToUrlAfterLogin(this.url.current());
            }
            else if (confirm("Request failed. Do you want to see the error details?")) {
                open(url, "_blank");
            }
        };
        AjaxRedirect.prototype.redirect = function (event) {
            if (event.ctrlKey || event.button === 1) {
                return true;
            }
            var link = $(event.currentTarget);
            var url = link.attr("href");
            var ajaxTarget = link.attr("ajax-target");
            var ajaxhref = link.attr("href");
            var ajaxUrl = link.attr("ajax-href");
            if (ajaxUrl != null && ajaxUrl != undefined)
                url = ajaxUrl;
            this.go(url, link, false, false, true, undefined, ajaxTarget, ajaxhref);
            return false;
        };
        AjaxRedirect.prototype.go = function (url, trigger, isBack, keepScroll, addToHistory, onComplete, ajaxTarget, ajaxhref) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger) {
                trigger = $(window);
            }
            if (ajaxTarget && trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") {
                return;
            }
            url = this.url.effectiveUrlProvider(url, trigger);
            if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
                url = url.substring(this.url.baseContentUrl.length).substring(3);
            }
            this.isAjaxRedirecting = true;
            // this.serverInvoker.isAwaitingAjaxResponse = true;
            var requestCounter = ++this.requestCounter;
            // if (window.stop) {
            //     window.stop();
            // } else if (document.execCommand !== undefined) {
            //     document.execCommand("Stop", false);
            // }
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.waiting.show(false, false);
            $.ajax({
                url: url,
                type: "GET",
                xhrFields: { withCredentials: true },
                success: function (response) {
                    if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                    }
                    else if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory && !window.isModal()) {
                            var title = $("#page_meta_title").val();
                            var addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                _this.onRedirected(title, addressBar);
                            }
                            catch (error) {
                                addressBar = _this.url.makeAbsolute(_this.url.baseContentUrl, "/##" + addressBar);
                                history.pushState({}, title, addressBar);
                            }
                        }
                    }
                    // this.serverInvoker.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    _this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null, ajaxTarget, ajaxhref);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
                    if (onComplete) {
                        onComplete(true);
                    }
                },
                error: function (response) {
                    if (onComplete) {
                        onComplete(false);
                    }
                    if (_this.requestCounter === requestCounter) {
                        _this.onRedirectionFailed(url, response);
                    }
                },
                complete: function (response) { return _this.waiting.hide(); },
            });
            return false;
        };
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUlJLDBGQUEwRjtRQUMxRiw4R0FBOEc7UUFFOUcsc0JBQ1ksR0FBUSxFQUNSLGlCQUFvQyxFQUNwQyxPQUFnQjtZQUZoQixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFTO1lBVHBCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQVE3QixDQUFDO1FBRUUscUNBQWMsR0FBckIsVUFBc0IsUUFBZ0I7WUFBdEMsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFUyxtQ0FBWSxHQUF0QixVQUF1QixLQUFhLEVBQUUsR0FBVztZQUM3QyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVTLDBDQUFtQixHQUE3QixVQUE4QixHQUFXLEVBQUUsUUFBbUI7WUFDMUQsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQkFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDbEQ7aUJBQU0sSUFBSSxPQUFPLENBQUMsdURBQXVELENBQUMsRUFBRTtnQkFDekUsSUFBSSxDQUFDLEdBQUcsRUFBRSxR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