define(["require", "exports", "olive/Components/Waiting", "olive/Components/Validate", "olive/Components/Form", "olive/Config"], function (require, exports, Waiting_1, Validate_1, Form_1, Config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MvcAction = /** @class */ (function () {
        function MvcAction() {
        }
        MvcAction.invokeWithPost = function (event) {
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
        MvcAction.invokeWithAjax = function (event, actionUrl, syncCall, callback) {
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
                error: function (response) { return _this.onAjaxResponseError(response); },
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
        // Redirecting with Ajax
        MvcAction.onAjaxResponseError = function (response) {
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
        MvcAction.isAwaitingAjaxResponse = false;
        MvcAction.events = {};
        return MvcAction;
    }());
    exports.default = MvcAction;
});
//# sourceMappingURL=MvcAction.js.map