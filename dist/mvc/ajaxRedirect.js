define(["require", "exports", "olive/components/waiting", "olive/mvc/formAction"], function (require, exports, waiting_1, formAction_1) {
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
                            history.pushState({}, $("#page_meta_title").val(), trigger.attr("data-addressbar") || url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQUFBO1FBdUVBLENBQUM7UUFuRWlCLHVCQUFVLEdBQXhCLFVBQXlCLFFBQWdCO1lBQXpDLGlCQUVDO1lBREcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUVhLDJCQUFjLEdBQTVCLFVBQTZCLFFBQWdCO1lBQTdDLGlCQUVDO1lBREcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU0scUJBQVEsR0FBZixVQUFnQixLQUF3QjtZQUNwQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDckQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLGlCQUFJLEdBQVgsVUFBWSxLQUFL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