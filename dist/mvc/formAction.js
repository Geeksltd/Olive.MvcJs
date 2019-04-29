define(["require", "exports", "olive/components/waiting", "olive/components/validate", "olive/components/masterDetail", "olive/components/form", "olive/components/url", "olive/config", "olive/mvc/standardAction", "olive/components/liteEvent", "olive/components/modal"], function (require, exports, waiting_1, validate_1, masterDetail_1, form_1, url_1, config_1, standardAction_1, liteEvent_1, modal_1) {
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
                return false;
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
            actionUrl = url_1.default.effectiveUrlProvider(actionUrl, trigger);
            // If the request is cross domain, jquery won't send the header: X-Requested-With
            data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });
            var scrollPosition = $(window).scrollTop();
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                xhrFields: { withCredentials: true },
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { $(".tooltip").remove(); waiting_1.default.hide(); _this.processAjaxResponse(result, containerModule, trigger, null); },
                error: this.onAjaxResponseError,
                statusCode: {
                    401: function (data) {
                        url_1.default.onAuthenticationFailed();
                    }
                },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse = false;
                    trigger.removeClass('loading-action-result');
                    if (disableToo)
                        trigger.removeAttr('disabled');
                    var triggerTabIndex = $(":focusable").not("[tabindex='-1']").index($(triggerUniqueSelector));
                    if (!triggerUniqueSelector.endsWith(">button:eq(1)") && !triggerUniqueSelector.endsWith(">button:eq(2)") && !triggerUniqueSelector.endsWith(">a")) {
                        //trigger element is not a button, image or link so we should select next element.
                        triggerTabIndex++;
                    }
                    if (triggerTabIndex > -1)
                        $(":focusable").not("[tabindex='-1']").eq(triggerTabIndex).focus();
                    $(window).scrollTop(scrollPosition);
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
        FormAction.processAjaxResponse = function (response, containerModule, trigger, args) {
            var asElement = $(response);
            if (asElement.is("main")) {
                this.navigate(asElement, trigger, args);
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
        FormAction.navigate = function (element, trigger, args) {
            var _this = this;
            var referencedScripts = element.find("script[src]").map(function (i, s) { return $(s).attr("src"); });
            var referencedCss = element.find("link[rel='stylesheet']").map(function (i, s) { return $(s).attr("href"); });
            element.find("script[src]").remove();
            element.find("link[rel='stylesheet']").remove();
            //check for CSS links in the main tag after ajax call
            if (referencedCss.length > 0) {
                var contentLoaded_1 = false;
                referencedCss.each(function (i, item) {
                    if (!contentLoaded_1) {
                        //first add CSS files and then load content.
                        $("head").append($('<link rel="stylesheet" type="text/css" />')
                            .attr("href", item).load(item, function () { _this.processWithTheContent(trigger, element, args, referencedScripts); }));
                        contentLoaded_1 = true;
                    }
                    else if ($("link[href='" + item + "']") && $("link[href='" + item + "']").length === 0) {
                        $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", item));
                    }
                });
            }
            else
                this.processWithTheContent(trigger, element, args, referencedScripts);
        };
        FormAction.processWithTheContent = function (trigger, element, args, referencedScripts) {
            var width = $(window).width();
            var oldMain = trigger.closest("main");
            if (oldMain.length === 0)
                oldMain = $("main");
            var tooltips = $('body > .tooltip');
            tooltips.each(function (index, elem) {
                if ($('[aria-discribedby=' + elem.id + ']'))
                    elem.remove();
            });
            if (width <= 800 && trigger.data("transition") == "slide") {
                var newMain_1 = element.appendTo(oldMain.parent());
                oldMain.css("position", "fixed");
                if (args == "back") {
                    newMain_1.addClass("w3-animate-left");
                    oldMain.addClass("w3-animate-righter");
                }
                else {
                    newMain_1.addClass("w3-animate-right");
                    oldMain.addClass("w3-animate-lefter");
                }
                setTimeout(function () {
                    oldMain.remove();
                    newMain_1.removeClass("w3-animate-left").removeClass("w3-animate-right");
                    FormAction.updateUrl(referencedScripts, element, trigger);
                }, 400);
            }
            else {
                oldMain.replaceWith(element);
                this.updateUrl(referencedScripts, element, trigger);
            }
        };
        FormAction.updateUrl = function (referencedScripts, element, trigger) {
            var _this = this;
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
            //open modal if needed
            if (!window.isModal() && url_1.default.getQuery("_modal") !== "") {
                var url = url_1.default.getQuery("_modal");
                new modal_1.default(null, url).open(false);
            }
        };
        FormAction.isAwaitingAjaxResponse = false;
        FormAction.events = {};
        FormAction.dynamicallyLoadedScriptFiles = [];
        FormAction.onViewChanged = new liteEvent_1.default();
        return FormAction;
    }());
    exports.default = FormAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tdmMvZm9ybUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWdCQTtRQUFBO1FBMlBBLENBQUM7UUFwUGlCLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQixFQUFFLEtBQWEsRUFBRSxRQUFnQjtZQUFwRixpQkFRQztZQVBHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDeEIsVUFBQyxDQUFDO2dCQUNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLGFBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVhLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQjtZQUFuRCxpQkFBZ0o7WUFBekYsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFekkseUJBQWMsR0FBckIsVUFBc0IsS0FBSztZQUN2QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsSUFBSSxlQUFlLENBQUMsRUFBRSxD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