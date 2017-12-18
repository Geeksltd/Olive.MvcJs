define(["require", "exports", "olive/Components/Waiting", "olive/Components/FormAction"], function (require, exports, Waiting_1, FormAction_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AjaxRedirect = /** @class */ (function () {
        function AjaxRedirect() {
        }
        AjaxRedirect.enable = function (event, callback) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.go(url, link, false, false, true, function (response, containerModule, trigger) { callback(response, containerModule, trigger); });
            return false;
        };
        AjaxRedirect.back = function (event, backCallback) {
            if (this.ajaxChangedUrl == 0)
                return;
            this.ajaxChangedUrl--;
            this.go(location.href, null, true, false, true, function (response, containerModule, trigger) { backCallback(response, containerModule, trigger); });
        };
        AjaxRedirect.go = function (url, trigger, isBack, keepScroll, addToHistory, callback) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            this.isAjaxRedirecting = true;
            FormAction_1.default.isAwaitingAjaxResponse = true;
            if (window.stop)
                window.stop();
            else if (document.execCommand !== undefined)
                document.execCommand("Stop", false);
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            Waiting_1.default.showPleaseWait();
            $.ajax({
                url: url,
                type: 'GET',
                success: function (response) {
                    FormAction_1.default.events = {};
                    if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory)
                            history.pushState({}, $("#page_meta_title").val(), url);
                    }
                    FormAction_1.default.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    callback(response, null, trigger);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
                },
                error: function (response) { return location.href = url; },
                complete: function (response) { return Waiting_1.default.hidePleaseWait(); }
            });
            return false;
        };
        AjaxRedirect.ajaxChangedUrl = 0;
        AjaxRedirect.isAjaxRedirecting = false;
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
//# sourceMappingURL=AjaxRedirect.js.map