define(["require", "exports", "olive/components/waiting", "olive/components/Url", "olive/mvc/formAction"], function (require, exports, waiting_1, Url_1, formAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AjaxRedirect = /** @class */ (function () {
        function AjaxRedirect() {
        }
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
            if (this.ajaxChangedUrl == 0)
                return;
            this.ajaxChangedUrl--;
            this.go(location.href, null, true, false, false);
        };
        AjaxRedirect.go = function (url, trigger, isBack, keepScroll, addToHistory) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger)
                trigger = $(window);
            url = Url_1.default.getEffectiveUrl(url, trigger);
            if (url.indexOf(Url_1.default.baseContentUrl + "/##") == 0) {
                url = url.substring(Url_1.default.baseContentUrl.length).substring(3);
                console.log("## Redirecting to " + url);
            }
            this.isAjaxRedirecting = true;
            formAction_1.default.isAwaitingAjaxResponse = true;
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
                        if (addToHistory) {
                            var title = $("#page_meta_title").val();
                            var addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                history.pushState({}, title, addressBar);
                            }
                            catch (error) {
                                addressBar = Url_1.default.makeAbsolute(Url_1.default.baseContentUrl, "/##" + addressBar);
                                history.pushState({}, title, addressBar);
                            }
                        }
                    }
                    formAction_1.default.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    formAction_1.default.processAjaxResponse(response, null, trigger);
                    if (keepScroll)
                        $(document).scrollTop(scrollTopBefore);
                },
                error: function (response) {
                    if (confirm("Request failed. Do you want to see the error details?"))
                        open(url, "_blank");
                },
                complete: function (response) { return waiting_1.default.hide(); }
            });
            return false;
        };
        AjaxRedirect.ajaxChangedUrl = 0;
        AjaxRedirect.isAjaxRedirecting = false;
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQUFBO1FBd0ZBLENBQUM7UUFwRmlCLHVCQUFVLEdBQXhCLFVBQXlCLFFBQWdCO1lBQXpDLGlCQUVDO1lBREcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVhLDJCQUFjLEdBQTVCLFVBQTZCLFFBQWdCO1lBQTdDLGlCQUVDO1lBREcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU0scUJBQVEsR0FBZixVQUFnQixLQUF3QjtZQUNwQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLGlCQUFJLEdBQVgsVUFBWSxLQUFL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