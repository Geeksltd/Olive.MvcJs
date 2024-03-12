define(["require", "exports", "olive/config"], function (require, exports, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ServerInvoker {
        constructor(url, validate, waiting, form, responseProcessor) {
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.form = form;
            this.responseProcessor = responseProcessor;
            this.isAwaitingAjaxResponse = false;
            this.onAjaxResponseError = (jqXHR, status, error) => {
                this.waiting.hide();
                let text = jqXHR.responseText;
                if (text) {
                    if (text.indexOf("<html") > -1) {
                        document.write(text);
                    }
                    else if (text.indexOf("<form") > -1) {
                        let form = $("form", document);
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
            this.showWaitingBar = () => {
                let body = $("body");
                let waitingBar = $(`<div id="waiting-bar" style="position:fixed; 
                                                            top:0; 
                                                            left:0;
                                                            width:100vw;
                                                            height:100vh; 
                                                            background-color: rgba(0,0,0,0.4);
                                                            z-index:100;
                                                            overflow: auto; 
                                                            display:flex; 
                                                            justify-content:center; 
                                                            align-items:center;">`)
                    .append($(`<div style="width:300px; height:30px;">`)
                    .append($(`<div class="progress" style="height: 100%;">`)
                    .append($(`<div class="progress-bar progress-bar-striped progress-bar-animated"
                                        role="progressbar" 
                                        aria-valuenow="100" 
                                        aria-valuemin="0" 
                                        aria-valuemax="100" 
                                        style="width: 100%;
                                              animation: 1s linear infinite progress-bar-stripes;">`))));
                body.append(waitingBar);
            };
            this.removeWaitingBar = () => {
                let waitingBar = $("#waiting-bar");
                if (waitingBar.length > 0) {
                    waitingBar.remove();
                }
            };
        }
        enableInvokeWithAjax(selector, event, attrName) {
            selector.off(event).on(event, (e) => {
                let trigger = $(e.currentTarget);
                let url = this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                this.invokeWithAjax(e, url, false);
                return false;
            });
        }
        enableinvokeWithPost(selector) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost(e)); }
        invokeWithPost(event) {
            let trigger = $(event.currentTarget);
            let containerModule = trigger.closest("[data-module]");
            if (containerModule.is("form") && this.validate.validateForm(trigger) == false)
                return false;
            let data = this.form.getPostData(trigger);
            let url = this.url.effectiveUrlProvider(trigger.attr("formaction"), trigger);
            let form = $("<form method='post' />").hide().appendTo($("body"));
            for (let item of data)
                $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
            form.attr("action", url).submit();
            return false;
        }
        invokeWithAjax(event, actionUrl, syncCall = false) {
            let trigger = $(event.currentTarget);
            let triggerUniqueSelector = trigger.getUniqueSelector();
            let containerModule = trigger.closest("[data-module]");
            if (this.validate.validateForm(trigger) == false) {
                this.waiting.hide();
                return false;
            }
            let data_before_disable = this.form.getPostData(trigger);
            let disableToo = config_1.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse = true;
            if (containerModule.is("[waiting-bar]")) {
                this.showWaitingBar();
            }
            actionUrl = this.url.effectiveUrlProvider(actionUrl, trigger);
            // If the request is cross domain, jquery won't send the header: X-Requested-With
            data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });
            const scrollPosition = $(window).scrollTop();
            const context = {
                trigger,
                containerModule,
                url: actionUrl,
            };
            this.onInvocation(event, context);
            if (actionUrl != undefined && actionUrl != null && actionUrl.toLowerCase().contains("returnurl=") && !actionUrl.toLowerCase().contains("returnurl=...")) {
                var baseurl = actionUrl.substring(0, actionUrl.toLowerCase().indexOf("returnurl="));
                var returnurl = actionUrl.substring(actionUrl.toLowerCase().indexOf("returnurl="));
                returnurl = returnurl.replace(new RegExp("&", 'g'), "%26");
                actionUrl = baseurl + returnurl;
            }
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                xhrFields: { withCredentials: true },
                async: !syncCall,
                data: data_before_disable,
                success: (result) => {
                    $(".tooltip").remove();
                    this.waiting.hide();
                    this.removeWaitingBar();
                    this.responseProcessor.processAjaxResponse(result, containerModule, trigger, null, null, null);
                },
                error: this.onAjaxResponseError,
                statusCode: {
                    401: (data) => {
                        this.url.onAuthenticationFailed();
                    }
                },
                complete: (x) => {
                    this.isAwaitingAjaxResponse = false;
                    this.removeWaitingBar();
                    this.onInvocationCompleted(event, context);
                    trigger.removeClass('loading-action-result');
                    if (disableToo)
                        trigger.removeAttr('disabled');
                    let triggerTabIndex = $(":focusable").not("[tabindex='-1']").index($(triggerUniqueSelector));
                    if (!trigger.is("button") && !trigger.is("a")) {
                        //trigger element is not a button, image or link so we should select next element.
                        triggerTabIndex++;
                    }
                    if (triggerTabIndex > -1)
                        $(":focusable").not("[tabindex='-1']").eq(triggerTabIndex).focus();
                    $(window).scrollTop(scrollPosition);
                    this.onInvocationProcessed(event, context);
                }
            });
            return false;
        }
        onInvocation(event, context) {
        }
        onInvocationProcessed(event, context) {
        }
        onInvocationCompleted(event, context) {
        }
    }
    exports.default = ServerInvoker;
});
// <div style="position:fixed; top:0; left:0;width:100vw;height:100vh; rgba(0,0,0,0.4);z-index:100;overflow: auto; display:flex; justify-content:center; align-items:center">
//     <div style="width:300px; height:30px; background-color:white; opacity:1">
//         <div class="progress" style="height: 100%;">
//             <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
//         </div>
//     </div>
// </div>
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVySW52b2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tdmMvc2VydmVySW52b2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFPQSxNQUFxQixhQUFhO1FBRzlCLFlBQ1ksR0FBUSxFQUNSLFFBQWtCLEVBQ2xCLE9BQWdCLEVBQ2hCLElBQVUsRUFDVixpQkFBb0M7WUFKcEMsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGFBQVEsR0FBUixRQUFRLENBQVU7WUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUNoQixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQ1Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQVB6QywyQkFBc0IsR0FBRyxLQUFLLENBQUM7WUF5SS9CLHdCQUFtQixHQUFHLENBQUMsS0FBZ0IsRUFBRSxNQUFjLEVBQUUsS0FBYSxFQUFFLEVBQUU7Z0JBQzdFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBRXBCLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUM7Z0JBRTlCLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ1AsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQzdCLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pCLENBQUM7eUJBQ0ksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ2xDLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQy9CLElBQUksSUFBSSxDQUFDLE1BQU07NEJBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7NEJBQ3RDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFD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