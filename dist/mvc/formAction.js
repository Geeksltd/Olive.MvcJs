define(["require", "exports", "olive/components/waiting", "olive/components/validate", "olive/components/masterDetail", "olive/components/form", "olive/components/url", "olive/config", "olive/mvc/standardAction", "olive/components/liteEvent"], function (require, exports, waiting_1, validate_1, masterDetail_1, form_1, url_1, config_1, standardAction_1, liteEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var FormAction = /** @class */ (function () {
        function FormAction() {
        }
        FormAction.enableInvokeWithAjax = function (selector, event, attrName) {
            var _this = this;
            selector.off(event).on(event, function (e) {
                var trigger = $(e.currentTarget);
                var url = url_1.default.getEffectiveUrl(trigger.attr(attrName), trigger);
                _this.invokeWithAjax(e, url, false);
            });
        };
        FormAction.enableinvokeWithPost = function (selector) {
            var _this = this;
            selector.off("click.formaction").on("click.formaction", function (e) { return _this.invokeWithPost(e); });
        };
        FormAction.invokeWithPost = function (event) {
            var trigger = $(event.currentTarget);
            var containerModule = trigger.closest("[data-module]");
            if (containerModule.is("form") && validate_1.default.validateForm(trigger) == false)
                return false;
            var data = form_1.default.getPostData(trigger);
            var url = url_1.default.getEffectiveUrl(trigger.attr("formaction"), trigger);
            var form = $("<form method='post' />").hide().appendTo($("body"));
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
            }
            form.attr("action", url).submit();
            return false;
        };
        FormAction.invokeWithAjax = function (event, actionUrl, syncCall) {
            var _this = this;
            if (syncCall === void 0) { syncCall = false; }
            var trigger = $(event.currentTarget);
            var triggerUniqueSelector = trigger.getUniqueSelector();
            var containerModule = trigger.closest("[data-module]");
            if (validate_1.default.validateForm(trigger) == false) {
                waiting_1.default.hide();
                return false;
            }
            var data_before_disable = form_1.default.getPostData(trigger);
            var disableToo = config_1.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse = true;
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                xhrFields: { withCredentials: true },
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { waiting_1.default.hide(); _this.processAjaxResponse(result, containerModule, trigger); },
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
        FormAction.onAjaxResponseError = function (response) {
            waiting_1.default.hide();
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
        FormAction.processAjaxResponse = function (response, containerModule, trigger) {
            var asElement = $(response);
            if (asElement.is("main")) {
                this.replaceMain(asElement, trigger);
                return;
            }
            if (asElement.is("[data-module]")) {
                containerModule.replaceWith(asElement);
                this.raiseViewChanged(asElement, trigger);
                return;
            }
            if (response.length == 1 && response[0].ReplaceView) {
                asElement = $("<div/>").append(response[0].ReplaceView);
                containerModule.replaceWith(asElement);
                this.raiseViewChanged(asElement, trigger);
                return;
            }
            if (trigger && trigger.is("[data-add-subform]")) {
                var subFormName = trigger.attr("data-add-subform");
                var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
                if (container.length == 0)
                    container = containerModule.find("[data-subform=" + subFormName + "]:first");
                container.append(asElement);
                validate_1.default.reloadRules(trigger.parents("form"));
                masterDetail_1.default.updateSubFormStates();
                this.raiseViewChanged(asElement, trigger);
                return;
            }
            // List of actions
            standardAction_1.default.runAll(response, trigger);
        };
        FormAction.raiseViewChanged = function (container, trigger, isNewPage) {
            if (isNewPage === void 0) { isNewPage = false; }
            this.onViewChanged.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
        };
        FormAction.replaceMain = function (element, trigger) {
            var _this = this;
            var referencedScripts = element.find("script[src]").map(function (i, s) { return $(s).attr("src"); });
            element.find("script[src]").remove();
            $("main").replaceWith(element);
            if (referencedScripts.length) {
                var expectedScripts_1 = referencedScripts.length;
                var loadedScripts_1 = 0;
                referencedScripts.each(function (index, item) {
                    var url = '' + item;
                    if (_this.dynamicallyLoadedScriptFiles.indexOf(url) > -1) {
                        loadedScripts_1++;
                        if (loadedScripts_1 == expectedScripts_1)
                            _this.raiseViewChanged(element, trigger, true);
                    }
                    else {
                        _this.dynamicallyLoadedScriptFiles.push(url);
                        $.getScript(url, function () {
                            loadedScripts_1++;
                            if (loadedScripts_1 == expectedScripts_1)
                                _this.raiseViewChanged(element, trigger, true);
                        });
                    }
                });
            }
            else
                this.raiseViewChanged(element, trigger, true);
            document.title = $("#page_meta_title").val();
        };
        FormAction.isAwaitingAjaxResponse = false;
        FormAction.events = {};
        FormAction.dynamicallyLoadedScriptFiles = [];
        FormAction.onViewChanged = new liteEvent_1.default();
        return FormAction;
    }());
    exports.default = FormAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tdmMvZm9ybUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWdCQTtRQUFBO1FBNkpBLENBQUM7UUFySmlCLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQixFQUFFLEtBQWEsRUFBRSxRQUFnQjtZQUFwRixpQkFPQztZQU5HLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDeEIsVUFBQyxDQUFDO2dCQUNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLGFBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDL0QsS0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVhLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQjtZQUFuRCxpQkFBZ0o7WUFBekYsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFekkseUJBQWMsR0FBckIsVUFBc0IsS0FBSztZQUN2QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMs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