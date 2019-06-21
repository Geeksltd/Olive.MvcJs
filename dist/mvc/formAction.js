define(["require", "exports", "olive/components/waiting", "olive/components/validate", "olive/components/masterDetail", "olive/components/form", "olive/components/url", "olive/config", "olive/mvc/standardAction", "olive/components/liteEvent", "../components/modal"], function (require, exports, waiting_1, validate_1, masterDetail_1, form_1, url_1, config_1, standardAction_1, liteEvent_1, modal_1) {
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
                    if (!trigger.is("button") && !trigger.is("a")) {
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
            modal_1.default.tryOpenFromUrl();
            //if (!window.isModal() && Url.getQuery("_modal") !== "") {
            //    let url: string = Url.getQuery("_modal");
            //    new Modal(null, url).open(false);
            //}
        };
        FormAction.isAwaitingAjaxResponse = false;
        FormAction.events = {};
        FormAction.dynamicallyLoadedScriptFiles = [];
        FormAction.onViewChanged = new liteEvent_1.default();
        return FormAction;
    }());
    exports.default = FormAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybUFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tdmMvZm9ybUFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWdCQTtRQUFBO1FBNFBBLENBQUM7UUFyUGlCLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQixFQUFFLEtBQWEsRUFBRSxRQUFnQjtZQUFwRixpQkFRQztZQVBHLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssRUFDeEIsVUFBQyxDQUFDO2dCQUNFLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLGFBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ25DLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVhLCtCQUFvQixHQUFsQyxVQUFtQyxRQUFnQjtZQUFuRCxpQkFBZ0o7WUFBekYsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxVQUFDLENBQUMsSUFBSyxPQUFBLEtBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFekkseUJBQWMsR0FBckIsVUFBc0IsS0FBSztZQUN2QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdkQsSUFBSSxlQUFlLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGtCQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUs7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFFeEYsSUFBSSxJQUFJLEdBQUcsY0FBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxJQUFJLEdBQUcsR0FBRyxhQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN4RSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFbEUsS0FBaUIsVUFBSSxFQUFKLGFBQUksRUFBSixrQkFBSSxFQUFKLElBQUk7Z0JBQWhCLElBQUksSUFBSSxhQUFBO2dCQUNULENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQUE7WUFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEMsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLHlCQUFjLEdBQXJCLFVBQXNCLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBZ0I7WUFBeEQsaUJBbURDO1lBbkR1Qyx5QkFBQSxFQUFBLGdCQUFnQjtZQUVwRCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JDLElBQUkscUJBQXFCLEdBQVcsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDaEUsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUV2RCxJQUFJLGtCQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRTtnQkFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUFDLE9BQU8sS0FBSyxDQUFDO2FBQUU7WUFDOUUsSUFBSSxtQkFBbUIsR0FBRyxjQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3BELElBQUksVUFBVSxHQUFHLGdCQUFNLENBQUMsMkJBQTJCLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hGLElBQUksVUFBVTtnQkFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRCxPQUFPLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDMUMsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQztZQUVuQyxTQUFTLEdBQUcsYUFBRyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUV6RCxpRkFBaUY7WUFDakYsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFFN0csSUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRTdDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0gsR0FBRyxFQUFFLFNBQVM7Z0JBQ2QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxNQUFNO2dCQUNoRCxTQUFTLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFO2dCQUNwQyxLQUFLLEVBQUUsQ0FBQyxRQUFRO2dCQUNoQixJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixPQUFPLEVBQUUsVUFBQyxNQUFNLElBQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xJLEtBQUssRUFBRSxJQUFJLENBQUMsbUJBQW1CO2dCQUMvQixVQUFVLEVBQUU7b0JBQ1IsR0FBRyxFQUFFLFVBQUMsSUFBSTt3QkFDTixhQUFHLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDakMsQ0FBQztpQkFDSjtnQkFDRCxRQUFRLEVBQUUsVUFBQyxDQUFDO29CQUNSLEtBQUksQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7b0JBQ3BDLE9BQU8sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxVQUFVO3dCQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBRS9DLElBQUksZUFBZSxHQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztvQkFFckcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUMzQyxrRkFBa0Y7d0JBQ2xGLGVBQWUsRUFBRSxDQUFDO3FCQUNyQjtvQkFFRCxJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7d0JBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDN0YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDeEMsQ0FBQzthQUNKLENBQUMsQ0FBQztZQUVILE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFYSw4QkFBbUIsR0FBakMsVUFBa0MsS0FBZ0IsRUFBRSxNQUFjLEVBQUUsS0FBYTtZQUM3RSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWYsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztZQUU5QixJQUFJLElBQUksRUFBRTtnQkFDTixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQzVCLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hCO3FCQUNJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtvQkFDakMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDL0IsSUFBSSxJQUFJLENBQUMsTUFBTTt3QkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzt3QkFDdEMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDN0I7O29CQUNJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNwQjtpQkFDSSxJQUFJLEtBQUs7Z0JBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDOztnQkFDeEIsS0FBSyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFHYSw4QkFBbUIsR0FBakMsVUFBa0MsUUFBUSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsSUFBSTtZQUV0RSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU87YUFDVjtZQUVELElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDL0IsZUFBZSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDMUMsT0FBTzthQUNWO1lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFO2dCQUNqRCxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hELGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLE9BQU87YUFDVjtZQUVELElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRTtnQkFDN0MsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLFNBQVMsR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUUvRixJQUFJLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFDckIsU0FBUyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDO2dCQUVqRixTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM1QixrQkFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLHNCQUFZLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDMUMsT0FBTzthQUNWO1lBRUQsa0JBQWtCO1lBQ2xCLHdCQUFjLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBRU0sMkJBQWdCLEdBQXZCLFVBQXdCLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBMEI7WUFBMUIsMEJBQUEsRUFBQSxpQkFBMEI7WUFDbEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDL0YsQ0FBQztRQUdNLG1CQUFRLEdBQWYsVUFBZ0IsT0FBZSxFQUFFLE9BQU8sRUFBRSxJQUFJO1lBQTlDLGlCQTBCQztZQXhCRyxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQWhCLENBQWdCLENBQUMsQ0FBQztZQUNwRixJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQWpCLENBQWlCLENBQUMsQ0FBQztZQUM1RixPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVoRCxxREFBcUQ7WUFDckQsSUFBSSxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDMUIsSUFBSSxlQUFhLEdBQVksS0FBSyxDQUFDO2dCQUNuQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLElBQVM7b0JBRTVCLElBQUksQ0FBQyxlQUFhLEVBQUU7d0JBQ2hCLDRDQUE0Qzt3QkFDNUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkNBQTJDLENBQUM7NkJBQzFELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxjQUFRLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFdEgsZUFBYSxHQUFHLElBQUksQ0FBQztxQkFDeEI7eUJBQ0ksSUFBSSxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO3dCQUNwRixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztxQkFDdkY7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7YUFDTjs7Z0JBRUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUVjLGdDQUFxQixHQUFwQyxVQUFxQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUI7WUFFMUUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRTlCLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEMsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5QyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUVwQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsS0FBSyxFQUFFLElBQUk7Z0JBQ3RCLElBQUksQ0FBQyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO29CQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxPQUFPLEVBQUU7Z0JBQ3ZELElBQUksU0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7Z0JBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUVqQyxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7b0JBQ2hCLFNBQU8sQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2lCQUMxQztxQkFDSTtvQkFDRCxTQUFPLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBQ3JDLE9BQU8sQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQztpQkFDekM7Z0JBRUQsVUFBVSxDQUFDO29CQUNQLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDakIsU0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUN2RSxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDOUQsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ1g7aUJBQ0k7Z0JBQ0QsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDdkQ7UUFDTCxDQUFDO1FBRWMsb0JBQVMsR0FBeEIsVUFBeUIsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLE9BQU87WUFBNUQsaUJBK0JDO1lBOUJHLElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFO2dCQUMxQixJQUFJLGlCQUFlLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUMvQyxJQUFJLGVBQWEsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxJQUFJO29CQUMvQixJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO29CQUNwQixJQUFJLEtBQUksQ0FBQyw0QkFBNEIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7d0JBQ3JELGVBQWEsRUFBRSxDQUFDO3dCQUNoQixJQUFJLGVBQWEsSUFBSSxpQkFBZTs0QkFDaEMsS0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQ3JEO3lCQUNJO3dCQUNELEtBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQzVDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFOzRCQUNiLGVBQWEsRUFBRSxDQUFDOzRCQUNoQixJQUFJLGVBQWEsSUFBSSxpQkFBZTtnQ0FDaEMsS0FBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ3RELENBQUMsQ0FBQyxDQUFDO3FCQUNOO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2FBQ047O2dCQUNJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRW5ELFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFN0Msc0JBQXNCO1lBQ3RCLGVBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN2QiwyREFBMkQ7WUFDM0QsK0NBQStDO1lBQy9DLHVDQUF1QztZQUN2QyxHQUFHO1FBQ1AsQ0FBQztRQTFQYSxpQ0FBc0IsR0FBRyxLQUFLLENBQUM7UUFDdEMsaUJBQU0sR0FBb0MsRUFBRSxDQUFDO1FBQzdDLHVDQUE0QixHQUFHLEVBQUUsQ0FBQztRQUUzQix3QkFBYSxHQUFHLElBQUksbUJBQVMsRUFBeUIsQ0FBQztRQXVQekUsaUJBQUM7S0FBQSxBQTVQRCxJQTRQQztzQkE1UG9CLFVBQVUifQ==