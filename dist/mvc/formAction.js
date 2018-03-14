define(["require", "exports", "olive/components/waiting", "olive/components/validate", "olive/components/masterDetail", "olive/components/form", "olive/components/url", "olive/config", "olive/mvc/standardAction", "olive/components/liteEvent"], function (require, exports, waiting_1, validate_1, masterDetail_1, form_1, url_1, config_1, standardAction_1, liteEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var FormAction = /** @class */ (function () {
        function FormAction() {
        }
        FormAction.enableInvokeWithAjax = function (selector, event, attrName) {
            var _this = this;
            selector.off(event).on(event, function (e) {
                var trigger = $(e.currentTarget);
                var url = url_1.default.effectiveUrlProvider(trigger.attr(attrName), trigger);
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
            var url = url_1.default.effectiveUrlProvider(trigger.attr("formaction"), trigger);
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
                error: this.onAjaxResponseError,
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
        FormAction.onAjaxResponseError = function (jqXHR, status, error) {
            waiting_1.default.hide();
            var text = jqXHR.responseText;
            if (text) {
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
            }
            else if (error)
                alert(error);
            else
                alert("Error: response status: " + status);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tdmMvZm9ybUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWdCQTtRQUFBO1FBaUtBLENBQUM7UUF6SmlCLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQixFQUFFLEtBQWEsRUFBRSxRQUFnQjtZQUFwRixpQkFPQztZQU5HLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDeEIsVUFBQyxDQUFDO2dCQUNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLGFBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBRWEsK0JBQW9CLEdBQWxDLFVBQW1DLFFBQWdCO1lBQW5ELGlCQUFnSjtZQUF6RixRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUV6SSx5QkFBYyxHQUFyQixVQUFzQixLQUFLO1lBQ3ZCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckMsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN2RCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FB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