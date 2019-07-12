define(["require", "exports", "olive/components/liteEvent", "olive/config", "olive/components/crossDomainEvent"], function (require, exports, liteEvent_1, config_1, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CombinedUtilities = /** @class */ (function () {
        function CombinedUtilities(url, 
        // private formAction: FormAction,
        waiting, modalHelper, validate, masterDetail, 
        // private standardAction: StandardAction,
        form, 
        // private ajaxRedirect: AjaxRedirect,
        select, alert) {
            this.url = url;
            this.waiting = waiting;
            this.modalHelper = modalHelper;
            this.validate = validate;
            this.masterDetail = masterDetail;
            this.form = form;
            this.select = select;
            this.alert = alert;
            this.requestCounter_ar = 0;
            this.ajaxChangedUrl_ar = 0;
            this.isAjaxRedirecting_ar = false;
            this.onRedirected_ar = this.defaultOnRedirected_ar;
            this.onRedirectionFailed_ar = this.defaultOnRedirectionFailed_ar;
            this.isAwaitingAjaxResponse_fa = false;
            this.events_fa = {};
            this.dynamicallyLoadedScriptFiles_fa = [];
            this.onViewChanged_fa = new liteEvent_1.default();
        }
        CombinedUtilities.prototype.defaultOnRedirected_ar = function (title, url) {
            history.pushState({}, title, url);
        };
        CombinedUtilities.prototype.defaultOnRedirectionFailed_ar = function (url, response) {
            if (confirm("Request failed. Do you want to see the error details?"))
                open(url, "_blank");
        };
        CombinedUtilities.prototype.enableBack_ar = function (selector) {
            var _this = this;
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return _this.back_ar(e); });
        };
        CombinedUtilities.prototype.enableRedirect_ar = function (selector) {
            var _this = this;
            selector.off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return _this.redirect_ar(e); });
        };
        CombinedUtilities.prototype.redirect_ar = function (event) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.go_ar(url, link, false, false, true);
            return false;
        };
        CombinedUtilities.prototype.back_ar = function (event) {
            if (this.modalHelper.isOrGoingToBeModal())
                window.location.reload();
            else {
                if (this.ajaxChangedUrl_ar == 0)
                    return;
                this.ajaxChangedUrl_ar--;
                this.go_ar(location.href, null, true, false, false);
            }
        };
        CombinedUtilities.prototype.go_ar = function (url, trigger, isBack, keepScroll, addToHistory) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger)
                trigger = $(window);
            url = this.url.effectiveUrlProvider(url, trigger);
            if (url.indexOf(this.url.baseContentUrl + "/##") == 0) {
                url = url.substring(this.url.baseContentUrl.length).substring(3);
                console.log("## Redirecting to " + url);
            }
            this.isAjaxRedirecting_ar = true;
            this.isAwaitingAjaxResponse_fa = true;
            var requestCounter = ++this.requestCounter_ar;
            if (window.stop)
                window.stop();
            else if (document.execCommand !== undefined)
                document.execCommand("Stop", false);
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.waiting.show(false, false);
            $.ajax({
                url: url,
                type: 'GET',
                xhrFields: { withCredentials: true },
                success: function (response) {
                    _this.events_fa = {};
                    if (!isBack) {
                        _this.ajaxChangedUrl_ar++;
                        if (addToHistory && !window.isModal()) {
                            var title = $("#page_meta_title").val();
                            var addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                _this.onRedirected_ar(title, addressBar);
                            }
                            catch (error) {
                                addressBar = _this.url.makeAbsolute(_this.url.baseContentUrl, "/##" + addressBar);
                                history.pushState({}, title, addressBar);
                            }
                        }
                    }
                    if (addToHistory) {
                        if (window.isModal() && addToHistory)
                            _this.modalHelper.changeUrl(url);
                    }
                    _this.isAwaitingAjaxResponse_fa = false;
                    _this.isAjaxRedirecting_ar = false;
                    _this.processAjaxResponse_fa(response, null, trigger, isBack ? "back" : null);
                    if (keepScroll)
                        $(document).scrollTop(scrollTopBefore);
                },
                error: function (response) {
                    if (_this.requestCounter_ar == requestCounter)
                        _this.onRedirectionFailed_ar(url, response);
                },
                complete: function (response) { return _this.waiting.hide(); }
            });
            return false;
        };
        CombinedUtilities.prototype.enableInvokeWithAjax_fa = function (selector, event, attrName) {
            var _this = this;
            selector.off(event).on(event, function (e) {
                var trigger = $(e.currentTarget);
                var url = _this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                _this.invokeWithAjax_fa(e, url, false);
                return false;
            });
        };
        CombinedUtilities.prototype.enableinvokeWithPost_fa = function (selector) {
            var _this = this;
            selector.off("click.formaction").on("click.formaction", function (e) { return _this.invokeWithPost_fa(e); });
        };
        CombinedUtilities.prototype.invokeWithPost_fa = function (event) {
            var trigger = $(event.currentTarget);
            var containerModule = trigger.closest("[data-module]");
            if (containerModule.is("form") && this.validate.validateForm(trigger) == false)
                return false;
            var data = this.form.getPostData(trigger);
            var url = this.url.effectiveUrlProvider(trigger.attr("formaction"), trigger);
            var form = $("<form method='post' />").hide().appendTo($("body"));
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
            }
            form.attr("action", url).submit();
            return false;
        };
        CombinedUtilities.prototype.invokeWithAjax_fa = function (event, actionUrl, syncCall) {
            var _this = this;
            if (syncCall === void 0) { syncCall = false; }
            var trigger = $(event.currentTarget);
            var triggerUniqueSelector = trigger.getUniqueSelector();
            var containerModule = trigger.closest("[data-module]");
            if (this.validate.validateForm(trigger) == false) {
                this.waiting.hide();
                return false;
            }
            var data_before_disable = this.form.getPostData(trigger);
            var disableToo = config_1.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse_fa = true;
            actionUrl = this.url.effectiveUrlProvider(actionUrl, trigger);
            // If the request is cross domain, jquery won't send the header: X-Requested-With
            data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });
            var scrollPosition = $(window).scrollTop();
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                xhrFields: { withCredentials: true },
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { $(".tooltip").remove(); _this.waiting.hide(); _this.processAjaxResponse_fa(result, containerModule, trigger, null); },
                error: this.onAjaxResponseError_fa,
                statusCode: {
                    401: function (data) {
                        _this.url.onAuthenticationFailed();
                    }
                },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse_fa = false;
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
        CombinedUtilities.prototype.onAjaxResponseError_fa = function (jqXHR, status, error) {
            this.waiting.hide();
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
        CombinedUtilities.prototype.processAjaxResponse_fa = function (response, containerModule, trigger, args) {
            var asElement = $(response);
            if (asElement.is("main")) {
                this.navigate_fa(asElement, trigger, args);
                return;
            }
            if (asElement.is("[data-module]")) {
                containerModule.replaceWith(asElement);
                this.raiseViewChanged_fa(asElement, trigger);
                return;
            }
            if (response.length == 1 && response[0].ReplaceView) {
                asElement = $("<div/>").append(response[0].ReplaceView);
                containerModule.replaceWith(asElement);
                this.raiseViewChanged_fa(asElement, trigger);
                return;
            }
            if (trigger && trigger.is("[data-add-subform]")) {
                var subFormName = trigger.attr("data-add-subform");
                var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
                if (container.length == 0)
                    container = containerModule.find("[data-subform=" + subFormName + "]:first");
                container.append(asElement);
                this.validate.reloadRules(trigger.parents("form"));
                this.masterDetail.updateSubFormStates();
                this.raiseViewChanged_fa(asElement, trigger);
                return;
            }
            // List of actions
            this.runAll_sa(response, trigger);
        };
        CombinedUtilities.prototype.raiseViewChanged_fa = function (container, trigger, isNewPage) {
            if (isNewPage === void 0) { isNewPage = false; }
            this.onViewChanged_fa.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
        };
        CombinedUtilities.prototype.navigate_fa = function (element, trigger, args) {
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
                            .attr("href", item).load(item, function () { _this.processWithTheContent_fa(trigger, element, args, referencedScripts); }));
                        contentLoaded_1 = true;
                    }
                    else if ($("link[href='" + item + "']") && $("link[href='" + item + "']").length === 0) {
                        $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", item));
                    }
                });
            }
            else
                this.processWithTheContent_fa(trigger, element, args, referencedScripts);
        };
        CombinedUtilities.prototype.processWithTheContent_fa = function (trigger, element, args, referencedScripts) {
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
                    this.updateUrl(referencedScripts, element, trigger);
                }, 400);
            }
            else {
                oldMain.replaceWith(element);
                this.updateUrl_fa(referencedScripts, element, trigger);
            }
        };
        CombinedUtilities.prototype.updateUrl_fa = function (referencedScripts, element, trigger) {
            var _this = this;
            if (referencedScripts.length) {
                var expectedScripts_1 = referencedScripts.length;
                var loadedScripts_1 = 0;
                referencedScripts.each(function (index, item) {
                    var url = '' + item;
                    if (_this.dynamicallyLoadedScriptFiles_fa.indexOf(url) > -1) {
                        loadedScripts_1++;
                        if (loadedScripts_1 == expectedScripts_1)
                            _this.raiseViewChanged_fa(element, trigger, true);
                    }
                    else {
                        _this.dynamicallyLoadedScriptFiles_fa.push(url);
                        $.getScript(url, function () {
                            loadedScripts_1++;
                            if (loadedScripts_1 == expectedScripts_1)
                                _this.raiseViewChanged_fa(element, trigger, true);
                        });
                    }
                });
            }
            else
                this.raiseViewChanged_fa(element, trigger, true);
            document.title = $("#page_meta_title").val();
            //open modal if needed
            this.modalHelper.tryOpenFromUrl();
            //if (!window.isModal() && Url.getQuery("_modal") !== "") {
            //    let url: string = Url.getQuery("_modal");
            //    new Modal(null, url).open(false);
            //}
        };
        CombinedUtilities.prototype.enableLinkModal_sa = function (selector) {
            var _this = this;
            selector.off("click.open-modal").on("click.open-modal", function (e) {
                if ($(e.currentTarget).attr("data-mode") === "iframe") {
                    _this.openModaliFrame_sa(e);
                }
                else {
                    _this.openModal_sa(e);
                }
                return false;
            });
        };
        CombinedUtilities.prototype.runStartup_sa = function (container, trigger, stage) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (stage === void 0) { stage = "Init"; }
            if (container == null)
                container = $(document);
            if (trigger == null)
                trigger = $(document);
            var actions = [];
            $("input[name='Startup.Actions']", container).each(function (index, item) {
                var action = $(item).val();
                if (actions.indexOf(action) === -1) {
                    //sometimes, we have a duplicate route in the action string, so we should remove them manually.
                    var names = action.trimStart("[{").trimEnd("}]").split("},{");
                    var uniqueNames_1 = [];
                    $.each(names, function (i, el) {
                        if ($.inArray(el, uniqueNames_1) === -1)
                            uniqueNames_1.push(el);
                    });
                    var stringResult_1 = "[{";
                    $.each(uniqueNames_1, function (i, itm) {
                        stringResult_1 += itm + "},{";
                    });
                    stringResult_1 = stringResult_1.trimEnd(",{") + "]";
                    actions.push(stringResult_1);
                }
            });
            for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                var action = actions_1[_i];
                if (action && (action.Stage || "Init") == stage)
                    this.runAll_sa(JSON.safeParse(action), trigger);
            }
        };
        CombinedUtilities.prototype.runAll_sa = function (actions, trigger) {
            if (trigger === void 0) { trigger = null; }
            for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                var action = actions_2[_i];
                if (!this.run_sa(action, trigger))
                    return;
            }
        };
        CombinedUtilities.prototype.run_sa = function (action, trigger) {
            var _this = this;
            if (action.Notify || action.Notify == "")
                this.notify_sa(action, trigger);
            else if (action.Script)
                eval(action.Script);
            else if (action.BrowserAction == "Back")
                window.history.back();
            else if (action.BrowserAction == "CloseModal") {
                if (window.page.modal.closeMe() === false)
                    return false;
            }
            else if (action.BrowserAction == "CloseModalRebindParent") {
                var opener_1 = this.modalHelper.currentModal.opener;
                if (window.page.modal.closeMe() === false)
                    return false;
                if (opener_1) {
                    var data = this.form.getPostData(opener_1.parents('form'));
                    $.post(window.location.href, data, function (response) {
                        _this.processAjaxResponse_fa(response, opener_1.closest("[data-module]"), opener_1, null);
                    });
                }
                else {
                    crossDomainEvent_1.default.raise(parent, 'refresh-page');
                }
            }
            else if (action.BrowserAction == "CloseModalRefreshParent") {
                window.page.modal.closeMe();
                crossDomainEvent_1.default.raise(parent, 'refresh-page');
            }
            else if (action.BrowserAction == "Close")
                window.close();
            else if (action.BrowserAction == "Refresh")
                window.page.refresh();
            else if (action.BrowserAction == "Print")
                window.print();
            else if (action.BrowserAction == "ShowPleaseWait")
                this.waiting.show(action.BlockScreen);
            else if (action.ReplaceSource)
                this.select.replaceSource(action.ReplaceSource, action.Items);
            else if (action.Download)
                window.download(action.Download);
            else if (action.Redirect)
                this.redirect_sa(action, trigger);
            else
                alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
            return true;
        };
        CombinedUtilities.prototype.notify_sa = function (action, trigger) {
            if (action.Obstruct == false)
                this.alert.alertUnobtrusively(action.Notify, action.Style);
            else
                this.alert.alert(action.Notify, action.Style);
        };
        CombinedUtilities.prototype.redirect_sa = function (action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && window.isModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal_sa({ currentTarget: trigger }, action.Redirect, null);
            else if (action.Target && action.Target != '')
                window.open(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
                this.go_ar(action.Redirect, trigger, false, false, true);
            else
                location.replace(action.Redirect);
        };
        CombinedUtilities.prototype.openModal_sa = function (event, url, options) {
            this.modalHelper.close();
            this.modalHelper.open(event, url, options);
        };
        CombinedUtilities.prototype.openModaliFrame_sa = function (event, url, options) {
            this.modalHelper.close();
            this.modalHelper.openiFrame(event, url, options);
        };
        return CombinedUtilities;
    }());
    exports.default = CombinedUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tYmluZWRVdGlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbXZjL2NvbWJpbmVkVXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBc0JBO1FBY0ksMkJBQ1ksR0FBUTtRQUNoQixrQ0FBa0M7UUFDMUIsT0FBZ0IsRUFDaEIsV0FBd0IsRUFDeEIsUUFBa0IsRUFDbEIsWUFBMEI7UUFDbEMsMENBQTBDO1FBQ2xDLElBQVU7UUFDbEIsc0NBQXNDO1FBQzlCLE1BQWMsRUFDZCxLQUFZO1lBVlosUUFBRyxHQUFILEdBQUcsQ0FBSztZQUVSLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDaEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDeEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUNsQixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUUxQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBRVYsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLFVBQUssR0FBTCxLQUFLLENBQU87WUF4QmhCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztZQUN0QixzQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFDdEIseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1lBQzlCLG9CQUFlLEdBQTJDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztZQUN0RiwyQkFBc0IsR0FBaUQsSUFBSSxDQUFDLDZCQUE2QixDQUFDO1lBRzFHLDhCQUF5QixHQUFHLEtBQUssQ0FBQztZQUNsQyxjQUFTLEdBQW9DLEVBQUUsQ0FBQztZQUMvQyxvQ0FBK0IsR0FBRyxFQUFFLENBQUM7WUFFdEMscUJBQWdCLEdBQUcsSUFBSSxtQkFBUyxFQUF5QixDQUFDO1FBYzdELENBQUM7UUFFRSxrREFBc0IsR0FBN0IsVUFBOEIsS0FBYSxFQUFFLEdBQVc7WUFDcEQsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTSx5REFB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