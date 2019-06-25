define(["require", "exports", "olive/components/waiting", "olive/components/url", "olive/mvc/formAction", "olive/components/modal"], function (require, exports, waiting_1, url_1, formAction_1, modal_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AjaxRedirect = /** @class */ (function () {
        function AjaxRedirect() {
        }
        AjaxRedirect.defaultOnRedirected = function (title, url) {
            history.pushState({}, title, url);
        };
        AjaxRedirect.defaultOnRedirectionFailed = function (url, response) {
            if (confirm("Request failed. Do you want to see the error details?"))
                open(url, "_blank");
        };
        AjaxRedirect.enableBack = function (selector) {
            var _this = this;
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return _this.back(e); });
        };
        AjaxRedirect.enableRedirect = function (selector) {
            var _this = this;
            selector.off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return _this.redirect(e); });
        };
        AjaxRedirect.redirect = function (event) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.go(url, link, false, false, true);
            return false;
        };
        AjaxRedirect.back = function (event) {
            if (modal_1.default.isOrGoingToBeModal())
                window.location.reload();
            else {
                if (this.ajaxChangedUrl == 0)
                    return;
                this.ajaxChangedUrl--;
                this.go(location.href, null, true, false, false);
            }
        };
        AjaxRedirect.go = function (url, trigger, isBack, keepScroll, addToHistory) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger)
                trigger = $(window);
            url = url_1.default.effectiveUrlProvider(url, trigger);
            if (url.indexOf(url_1.default.baseContentUrl + "/##") == 0) {
                url = url.substring(url_1.default.baseContentUrl.length).substring(3);
                console.log("## Redirecting to " + url);
            }
            this.isAjaxRedirecting = true;
            formAction_1.default.isAwaitingAjaxResponse = true;
            AjaxRedirect.lastWindowStopCall = new Date();
            if (window.stop)
                window.stop();
            else if (document.execCommand !== undefined)
                document.execCommand("Stop", false);
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            waiting_1.default.show(false, false);
            $.ajax({
                url: url,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: function (response) {
                    formAction_1.default.events = {};
                    if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory && !window.isModal()) {
                            var title = $("#page_meta_title").val();
                            var addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                _this.onRedirected(title, addressBar);
                            }
                            catch (error) {
                                addressBar = url_1.default.makeAbsolute(url_1.default.baseContentUrl, "/##" + addressBar);
                                history.pushState({}, title, addressBar);
                            }
                        }
                    }
                    if (addToHistory) {
                        if (window.isModal() && addToHistory)
                            modal_1.default.changeUrl(url);
                    }
                    formAction_1.default.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    formAction_1.default.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
                    if (keepScroll)
                        $(document).scrollTop(scrollTopBefore);
                },
                error: function (response) {
                    if (!AjaxRedirect.lastWindowStopCall || AjaxRedirect.lastWindowStopCall.getTime() < new Date().getTime() - 500)
                        _this.onRedirectionFailed(url, response);
                },
                complete: function (response) { return waiting_1.default.hide(); }
            });
            return false;
        };
        AjaxRedirect.ajaxChangedUrl = 0;
        AjaxRedirect.isAjaxRedirecting = false;
        AjaxRedirect.onRedirected = AjaxRedirect.defaultOnRedirected;
        AjaxRedirect.onRedirectionFailed = AjaxRedirect.defaultOnRedirectionFailed;
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFLQTtRQUFBO1FBNEdBLENBQUM7UUFyR1UsZ0NBQW1CLEdBQTFCLFVBQTJCLEtBQWEsRUFBRSxHQUFXO1lBQ2pELE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRWEsdUNBQTBCLEdBQXhDLFVBQXlDLEdBQVcsRUFBRSxRQUFtQjtZQUNyRSxJQUFJLE9BQU8sQ0FBQyx1REFBdUQsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBRWEsdUJBQVUsR0FBeEIsVUFBeUIsUUFBZ0I7WUFBekMsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBWixDQUFZLENBQUMsQ0FBQztRQUMzRixDQUFDO1FBRWEsMkJBQWMsR0FBNUIsVUFBNkIsUUFBZ0I7WUFBN0MsaUJBRUM7WUFERyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFFTSxxQkFBUSxHQUFmLFVBQWdCLEtBQXdCO1lBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FB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