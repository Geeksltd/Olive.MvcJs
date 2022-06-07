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
            var ajaxUrl = link.attr("ajax-href");
            if (ajaxUrl != null && ajaxUrl != undefined)
                url = ajaxUrl;
            this.go(url, link, false, false, true);
            return false;
        };
        AjaxRedirect.prototype.go = function (url, trigger, isBack, keepScroll, addToHistory, onComplete) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger) {
                trigger = $(window);
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
                    // this.formAction.events_fa = {};
                    if (!isBack) {
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
                    _this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
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