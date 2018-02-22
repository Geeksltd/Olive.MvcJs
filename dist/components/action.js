define(["require", "exports", "olive/components/waiting", "olive/components/validate", "olive/components/form", "olive/config"], function (require, exports, Waiting_1, Validate_1, Form_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Action = /** @class */ (function () {
        function Action() {
        }
        Action.ajaxRedirectBackClicked = function (event, backCallback) {
            if (this.ajaxChangedUrl == 0)
                return;
            this.ajaxChangedUrl--;
            this.ajaxRedirect(location.href, null, true, false, true, function (response, containerModule, trigger) { backCallback(response, containerModule, trigger); });
        };
        Action.invokeActionWithPost = function (event) {
            var trigger = $(event.currentTarget);
            var containerModule = trigger.closest("[data-module]");
            if (containerModule.is("form") && Validate_1.default.validateForm(trigger) == false)
                return false;
            var data = Form_1.default.getPostData(trigger);
            var url = trigger.attr("formaction");
            var form = $("<form method='post' />").hide().appendTo($("body"));
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
            }
            form.attr("action", url).submit();
            return false;
        };
        Action.enableAjaxRedirect = function (event, callback) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.ajaxRedirect(url, link, false, false, true, function (response, containerModule, trigger) { callback(response, containerModule, trigger); });
            return false;
        };
        Action.invokeActionWithAjax = function (event, actionUrl, syncCall, callback) {
            var _this = this;
            if (syncCall === void 0) { syncCall = false; }
            var trigger = $(event.currentTarget);
            var triggerUniqueSelector = trigger.getUniqueSelector();
            var containerModule = trigger.closest("[data-module]");
            if (Validate_1.default.validateForm(trigger) == false) {
                Waiting_1.default.hidePleaseWait();
                return false;
            }
            var data_before_disable = Form_1.default.getPostData(trigger);
            var disableToo = Config_1.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse = true;
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { Waiting_1.default.hidePleaseWait(); callback(result, containerModule, trigger); },
                error: function (response) { return _this.handleAjaxResponseError(response); },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse = false;
                    trigger.removeClass('loading-action-result');
                    if (disableToo)
                        trigger.removeAttr('disabled');
                    var triggerTabIndex = $(":focusable").index($(triggerUniqueSelector));
                    if (triggerTabIndex > -1)
                        $(":focusable").eq(triggerTabIndex + 1).focus();
                }
            });
            return false;
        };
        Action.ajaxRedirect = function (url, trigger, isBack, keepScroll, addToHistory, callback) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            this.isAjaxRedirecting = true;
            this.isAwaitingAjaxResponse = true;
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
                    Action.events = {};
                    if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory)
                            history.pushState({}, $("#page_meta_title").val(), url);
                    }
                    _this.isAwaitingAjaxResponse = false;
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
        Action.handleAjaxResponseError = function (response) {
            Waiting_1.default.hidePleaseWait();
            console.error(response);
            var text = response.responseText;
            if (text.indexOf("<html") > -1) {
                document.write(text);
            }
            else if (text.indexOf("<form") > -1) {
                var form = $("form", document);
                if (form.length)
                    form.replaceWith($(text));
                else
                    document.write(text);
            }
            else
                alert(text);
        };
        Action.ajaxChangedUrl = 0;
        Action.isAjaxRedirecting = false;
        Action.isAwaitingAjaxResponse = false;
        Action.events = {};
        return Action;
    }());
    exports.default = Action;
});
//# sourceMappingURL=Action.js.map