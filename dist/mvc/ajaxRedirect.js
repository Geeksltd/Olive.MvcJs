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
            if (confirm("Request failed. Do you want to see the error details?"))
                open(url, "_blank");
        };
        AjaxRedirect.prototype.redirect = function (event) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.go(url, link, false, false, true);
            return false;
        };
        AjaxRedirect.prototype.go = function (url, trigger, isBack, keepScroll, addToHistory, success) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger)
                trigger = $(window);
            url = this.url.effectiveUrlProvider(url, trigger);
            if (url.indexOf(this.url.baseContentUrl + "/##") == 0) {
                url = url.substring(this.url.baseContentUrl.length).substring(3);
                console.log("## Redirecting to " + url);
            }
            this.isAjaxRedirecting = true;
            // this.serverInvoker.isAwaitingAjaxResponse = true;
            var requestCounter = ++this.requestCounter;
            if (window.stop)
                window.stop();
            else if (document.execCommand !== undefined)
                document.execCommand("Stop", false);
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.waiting.show(false, false);
            $.ajax({
                url: url,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: function (response) {
                    //this.formAction.events_fa = {};
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
                    if (success) {
                        success();
                    }
                    // this.serverInvoker.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    _this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
                    if (keepScroll)
                        $(document).scrollTop(scrollTopBefore);
                },
                error: function (response) {
                    if (_this.requestCounter == requestCounter)
                        _this.onRedirectionFailed(url, response);
                },
                complete: function (response) { return _this.waiting.hide(); }
            });
            return false;
        };
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUlJLDBGQUEwRjtRQUMxRiw4R0FBOEc7UUFFOUcsc0JBQ1ksR0FBUSxFQUNSLGlCQUFvQyxFQUNwQyxPQUFnQjtZQUZoQixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFTO1lBVHBCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLHNCQUFpQixHQUFHLEtBQUssQ0FBQztRQVE5QixDQUFDO1FBRUUscUNBQWMsR0FBckIsVUFBc0IsUUFBZ0I7WUFBdEMsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFUyxtQ0FBWSxHQUF0QixVQUF1QixLQUFhLEVBQUUsR0FBVztZQUM3QyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVTLDBDQUFtQixHQUE3QixVQUE4QixHQUFXLEVBQUUsUUFBbUI7WUFDMUQsSUFBSSxPQUFPLENBQUMsdURBQXVELENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUVPLCtCQUFRLEdBQWhCLFVBQWlCLEtBQXdCO1lBQ3JDLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7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