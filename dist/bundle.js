var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("olive/config", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Config = /** @class */ (function () {
        function Config() {
        }
        // formats: http://momentjs.com/docs/#/displaying/format/
        Config.TIME_FORMAT = "HH:mm";
        Config.DATE_FORMAT = "DD/MM/YYYY";
        Config.DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
        Config.MINUTE_INTERVALS = 5;
        Config.DATE_LOCALE = "en-gb";
        Config.DISABLE_BUTTONS_DURING_AJAX = true;
        Config.REDIRECT_SCROLLS_UP = true;
        Config.AUTOCOMPLETE_INPUT_DELAY = 500;
        Config.DEFAULT_MODAL_BACKDROP = "static";
        /* Possible values: Compact | Medium | Advance | Full
        To customise modes, change '/Scripts/Lib/ckeditor_config.js' file */
        Config.DEFAULT_HTML_EDITOR_MODE = "Medium";
        Config.CK_EDITOR_BASE_PATH = '/lib/ckeditor/';
        return Config;
    }());
    exports.default = Config;
});
define("olive/components/crossDomainEvent", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CrossDomainEvent = /** @class */ (function () {
        function CrossDomainEvent() {
        }
        CrossDomainEvent.handle = function (command, handler) {
            window.addEventListener("message", function (e) {
                try {
                    var info = null;
                    if (e.data.startsWith("{")) {
                        info = JSON.parse(e.data);
                    }
                    else {
                        info = JSON.parse('"' + e.data + '"');
                    }
                    if (info.command !== command) {
                        return;
                    }
                    handler(info.arg);
                }
                catch (error) {
                    console.error(error);
                }
            }, false);
        };
        CrossDomainEvent.raise = function (window, command, arg) {
            if (arg === void 0) { arg = null; }
            var json = JSON.stringify({
                command: command,
                arg: arg,
            });
            window.postMessage(json, "*");
        };
        return CrossDomainEvent;
    }());
    exports.default = CrossDomainEvent;
});
define("olive/components/liteEvent", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var LiteEvent = /** @class */ (function () {
        function LiteEvent() {
            this.handlers = [];
        }
        LiteEvent.prototype.handle = function (handler) {
            this.handlers.push(handler);
        };
        LiteEvent.prototype.remove = function (handler) {
            this.handlers = this.handlers.filter(function (h) { return h !== handler; });
        };
        LiteEvent.prototype.raise = function (data) {
            this.handlers.slice(0).forEach(function (h) { return h(data); });
        };
        return LiteEvent;
    }());
    exports.default = LiteEvent;
});
define("olive/mvc/responseProcessor", ["require", "exports", "olive/components/liteEvent"], function (require, exports, liteEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResponseProcessor = /** @class */ (function () {
        function ResponseProcessor() {
            this.dynamicallyLoadedScriptFiles = [];
            this.subformChanged = new liteEvent_1.default();
            this.viewChanged = new liteEvent_1.default();
            this.processCompleted = new liteEvent_1.default();
            this.nothingFoundToProcess = new liteEvent_1.default();
        }
        ResponseProcessor.prototype.processAjaxResponse = function (response, containerModule, trigger, args, ajaxTarget, ajaxhref) {
            var asElement = $(response);
            if (ajaxTarget) {
                return;
            }
            if (asElement.is("main")) {
                this.navigate(asElement, trigger, args);
                return;
            }
            if (asElement.is("[data-module]") && containerModule != null) {
                containerModule.replaceWith(asElement);
                this.onViewChanged(asElement, trigger);
                return;
            }
            if (response.length == 1 && response[0].ReplaceView && containerModule != null) {
                asElement = $("<div/>").append(response[0].ReplaceView);
                containerModule.replaceWith(asElement);
                this.onViewChanged(asElement, trigger);
                return;
            }
            if (trigger && trigger.is("[data-add-subform]") && containerModule != null) {
                var subFormName = trigger.attr("data-add-subform");
                var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
                if (container.length == 0)
                    container = containerModule.find("[data-subform=" + subFormName + "]:first");
                container.append(asElement);
                // this.masterDetail.updateSubFormStates();
                this.onSubformChanged(response, trigger);
                this.onViewChanged(asElement, trigger);
                return;
            }
            // List of actions
            if (typeof (response) == typeof ([]))
                this.onNothingFoundToProcess(response, trigger);
        };
        ResponseProcessor.prototype.onNothingFoundToProcess = function (response, trigger) {
            this.nothingFoundToProcess.raise({ response: response, trigger: trigger });
        };
        ResponseProcessor.prototype.onSubformChanged = function (response, trigger) {
            this.subformChanged.raise({ response: response, trigger: trigger });
        };
        ResponseProcessor.prototype.onViewChanged = function (container, trigger, isNewPage) {
            if (isNewPage === void 0) { isNewPage = false; }
            this.viewChanged.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
        };
        ResponseProcessor.prototype.navigate = function (element, trigger, args) {
            var referencedScripts = element.find("script[src]").map(function (i, s) { return $(s).attr("src"); });
            var newCss = this.getNewCss(element);
            element.find("script[src]").remove();
            element.find("link[rel=stylesheet]").remove();
            // Process when at least one css is loaded.
            var loadedCssCount = 0;
            var $this = this;
            function _processWithTheContent($this, cssCount) {
                loadedCssCount++;
                if (loadedCssCount >= cssCount)
                    $this.processWithTheContent(trigger, element, args, referencedScripts);
            }
            if (newCss.length > 0) {
                var tags = newCss.map(function (item) { return $('<link rel="stylesheet" type="text/css" />').attr("href", item); });
                tags.forEach(function (e) {
                    e.on('load', function () { return _processWithTheContent($this, newCss.length); });
                    $("head").append(e);
                });
                //tags[0].on('load', () => this.processWithTheContent(trigger, element, args, referencedScripts));
                //$("head").append(tags);
            }
            else
                this.processWithTheContent(trigger, element, args, referencedScripts);
        };
        ResponseProcessor.prototype.navigatebyAjaxTarget = function (element, ajaxTarget) {
            //const ajaxTargesList = document.getElementsByName(ajaxTarget);
            //if (ajaxTargesList != undefined && ajaxTargesList != null && ajaxTargesList.length > 0) {
            //    for (var i = 0; i < ajaxTargesList.length; ++i) {
            //        if (ajaxTargesList[i].tagName == "MAIN") {
            //            var ajaxTargetElement = ajaxTargesList[i];
            //            break;
            //        }
            //    }
            //}
            //if (ajaxTargetElement == undefined || ajaxTargetElement == null) {
            //    console.log("There is not any main tag by name " + ajaxTarget + " in document");
            //    return;
            //}
            element.find("script[src]").remove();
            element.find("link[rel=stylesheet]").remove();
            var oldMain = $("main[name='" + ajaxTarget + "']");
            if (oldMain.length === 0) {
                console.error("There is no <main> object with the name of '" + ajaxTarget + "'.");
                return;
            }
            element.attr("name", ajaxTarget);
            var tooltips = $('body > .tooltip');
            tooltips.each(function (index, elem) {
                if ($('[aria-discribedby=' + elem.id + ']'))
                    elem.remove();
            });
            oldMain.replaceWith(element);
            //this.onViewChanged(element, oldMain, true);
            //this.onProcessCompleted();
        };
        ResponseProcessor.prototype.getNewCss = function (element) {
            var referencedCss = this.getCss(element);
            var currentCss = this.getCss($("body"));
            return referencedCss.filter(function (x) { return currentCss.indexOf(x) === -1; });
        };
        ResponseProcessor.prototype.getCss = function (parent) {
            var result = new Array();
            parent.find("link[rel=stylesheet]").each(function (i, s) { return result.push($(s).attr("href")); });
            return result;
        };
        ResponseProcessor.prototype.processWithTheContent = function (trigger, newMain, args, referencedScripts) {
            var _this = this;
            var width = $(window).width();
            var oldMain = trigger.closest("main");
            var targetMainName = trigger.attr("target");
            if (targetMainName) {
                oldMain = $("main[name='" + targetMainName + "']");
                if (oldMain.length === 0)
                    console.error("There is no <main> object with the name of '" + targetMainName + "'.");
            }
            else
                targetMainName = oldMain.attr("name");
            if (oldMain.length === 0)
                oldMain = $("main");
            if (targetMainName)
                newMain.attr("name", targetMainName);
            var tooltips = $('body > .tooltip');
            tooltips.each(function (index, elem) {
                if ($('[aria-discribedby=' + elem.id + ']'))
                    elem.remove();
            });
            if (width <= 800 && trigger.data("transition") == "slide") {
                newMain.appendTo(oldMain.parent());
                oldMain.css("position", "fixed");
                if (args == "back") {
                    newMain.addClass("w3-animate-left");
                    oldMain.addClass("w3-animate-righter");
                }
                else {
                    newMain.addClass("w3-animate-right");
                    oldMain.addClass("w3-animate-lefter");
                }
                setTimeout(function () {
                    oldMain.remove();
                    newMain.removeClass("w3-animate-left").removeClass("w3-animate-right");
                    _this.updateUrl(referencedScripts, newMain, trigger);
                }, 400);
            }
            else {
                oldMain.replaceWith(newMain);
                this.updateUrl(referencedScripts, newMain, trigger);
            }
        };
        ResponseProcessor.prototype.updateUrl = function (referencedScripts, element, trigger) {
            var _this = this;
            if (referencedScripts.length) {
                var expectedScripts_1 = referencedScripts.length;
                var loadedScripts_1 = 0;
                referencedScripts.each(function (_, item) {
                    var url = '' + item;
                    if (_this.dynamicallyLoadedScriptFiles.indexOf(url) > -1) {
                        loadedScripts_1++;
                        if (loadedScripts_1 == expectedScripts_1)
                            _this.onViewChanged(element, trigger, true);
                    }
                    else {
                        _this.dynamicallyLoadedScriptFiles.push(url);
                        $.getScript(url, function () {
                            loadedScripts_1++;
                            if (loadedScripts_1 == expectedScripts_1)
                                _this.onViewChanged(element, trigger, true);
                        });
                    }
                });
            }
            else
                this.onViewChanged(element, trigger, true);
            var modalTitleAttribute = $(".modal-dialog #page_meta_title").attr("value");
            var pageTitleAttribute = $("#page_meta_title").attr("value");
            if (modalTitleAttribute !== undefined || modalTitleAttribute !== undefined)
                document.title = modalTitleAttribute !== null && modalTitleAttribute !== void 0 ? modalTitleAttribute : pageTitleAttribute;
            this.onProcessCompleted();
        };
        ResponseProcessor.prototype.onProcessCompleted = function () {
            this.processCompleted.raise({});
        };
        return ResponseProcessor;
    }());
    exports.default = ResponseProcessor;
});
define("olive/components/url", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Url = /** @class */ (function () {
        function Url() {
            this.effectiveUrlProvider = function (u, t) { return u; };
            this.onAuthenticationFailed = this.goToLoginPage;
            this.baseContentUrl = window["BaseThemeUrl"] || '/';
        }
        Url.prototype.makeAbsolute = function (baseUrl, relativeUrl) {
            baseUrl = baseUrl || window.location.origin;
            relativeUrl = relativeUrl || '';
            if (relativeUrl.indexOf('/') != 0)
                relativeUrl = '/' + relativeUrl;
            if (baseUrl.charAt(baseUrl.length - 1) == '/')
                baseUrl = baseUrl.substring(0, baseUrl.length - 1);
            return baseUrl + relativeUrl;
        };
        Url.prototype.makeRelative = function (url) {
            if (this.isAbsolute(url))
                return url.split("/").splice(3).join("/");
            else
                return url;
        };
        Url.prototype.isAbsolute = function (url) {
            if (!url)
                return false;
            url = url.toLowerCase();
            return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
        };
        Url.prototype.current = function () { return window.location.href; };
        Url.prototype.goBack = function () {
            if (this.current().indexOf(this.baseContentUrl + "/##") === 0)
                history.back();
            else {
                var returnUrl = this.getQuery("ReturnUrl");
                if (returnUrl)
                    window.location.href = returnUrl;
                else
                    history.back();
            }
        };
        Url.prototype.updateQuery = function (uri, key, value) {
            if (uri == null)
                uri = window.location.href;
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re))
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            else
                return uri + separator + key + "=" + value;
        };
        Url.prototype.removeQuery = function (url, parameter) {
            //prefer to use l.search if you have a location/link object
            var urlParts = url.split('?');
            if (urlParts.length >= 2) {
                var prefix = encodeURIComponent(parameter).toLowerCase() + '=';
                var parts = urlParts[1].split(/[&;]/g);
                //reverse iteration as may be destructive
                for (var i = parts.length; i-- > 0;) {
                    //idiom for string.startsWith
                    if (parts[i].toLowerCase().lastIndexOf(prefix, 0) !== -1) {
                        parts.splice(i, 1);
                    }
                }
                url = urlParts[0] + '?' + parts.join('&');
                return url;
            }
            else {
                return url;
            }
        };
        Url.prototype.getQuery = function (name, url) {
            if (url === void 0) { url = null; }
            if (url)
                url = this.fullQueryString(url);
            else
                url = location.search;
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i"), results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        };
        Url.prototype.getModalQuery = function (name) {
            return this.getQuery(name, this.getQuery("_modal"));
        };
        Url.prototype.goToUrlAfterLogin = function (url) {
            window.location.href = "/login?returnUrl=/" + encodeURIComponent(this.makeRelative(url).trimStart("/"));
        };
        Url.prototype.goToLoginPage = function () {
            var query = this.current().split("/").splice(3).join("/");
            window.location.href = "/login?returnUrl=/" + query.trimStart("/");
        };
        Url.prototype.fullQueryString = function (url) {
            if (url == undefined || url == null)
                url = this.current();
            if (url.indexOf("?") == -1)
                return '';
            return url.substring(url.indexOf("?"));
        };
        Url.prototype.addQuery = function (url, key, value) { return url + (url.indexOf("?") == -1 ? "?" : "&") + key + "=" + value; };
        Url.prototype.removeEmptyQueries = function (url) {
            var items = this.fullQueryString(url).trimStart('?').split('&');
            var result = '';
            for (var i in items) {
                var key = items[i].split('=')[0];
                var val = items[i].split('=')[1];
                if (val != '' && val != undefined)
                    result += "&" + key + "=" + val;
            }
            if (items.length > 0)
                result = result.substring(1);
            if (url.indexOf('?') > -1)
                result = url.substring(0, url.indexOf('?') + 1) + result;
            else
                result = url;
            if (result.indexOf("?") == result.length - 1)
                result = result.substring(0, result.length - 1);
            return result;
        };
        Url.prototype.ofContent = function (relativeUrl) {
            var base = this.baseContentUrl;
            while (base.length > 0 && base[base.length - 1] === '/')
                base = base.substring(0, base.length - 1);
            while (relativeUrl.length > 0 && relativeUrl[0] === '/')
                relativeUrl = relativeUrl.substring(1);
            return base + '/' + relativeUrl;
        };
        return Url;
    }());
    exports.default = Url;
});
define("olive/components/waiting", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Waiting = /** @class */ (function () {
        function Waiting(url) {
            this.url = url;
        }
        Waiting.prototype.show = function (blockScreen, validate) {
            if (blockScreen === void 0) { blockScreen = false; }
            if (validate === void 0) { validate = true; }
            if (validate) {
                for (var i = 0; i < document.forms.length; i++)
                    if (!$(document.forms[i]).valid())
                        return;
            }
            var screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                $("<div class='cover' />")
                    .width(Math.max($(document).width(), $(window).width()))
                    .height(Math.max($(document).height(), $(window).height()))
                    .appendTo(screen);
            }
            var imageUrl = this.url.ofContent('/img/loading.gif');
            $("<div class='wait-container'><div class='wait-box'><img src='" + imageUrl + "'/></div>")
                .appendTo(screen)
                .show();
        };
        Waiting.prototype.hide = function () {
            $(".wait-screen").remove();
        };
        return Waiting;
    }());
    exports.default = Waiting;
});
define("olive/mvc/ajaxRedirect", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AjaxRedirect = /** @class */ (function () {
        // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
        // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;
        function AjaxRedirect(url, responseProcessor, waiting) {
            this.url = url;
            this.responseProcessor = responseProcessor;
            this.waiting = waiting;
            this.requestCounter = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
        }
        AjaxRedirect.prototype.enableRedirect = function (selector) {
            var _this = this;
            selector.off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return _this.redirect(e); });
        };
        AjaxRedirect.prototype.onRedirected = function (title, url) {
            history.pushState({}, title, url);
        };
        AjaxRedirect.prototype.onRedirectionFailed = function (url, response) {
            if (response.status === 401) {
                this.url.goToUrlAfterLogin(this.url.current());
            }
            else if (confirm("Request failed. Do you want to see the error details?")) {
                open(url, "_blank");
            }
        };
        AjaxRedirect.prototype.redirect = function (event) {
            if (event.ctrlKey || event.button === 1) {
                return true;
            }
            var link = $(event.currentTarget);
            var url = link.attr("href");
            var ajaxTarget = link.attr("ajax-target");
            var ajaxhref = link.attr("href");
            var ajaxUrl = link.attr("ajax-href");
            if (ajaxUrl != null && ajaxUrl != undefined)
                url = ajaxUrl;
            this.go(url, link, false, false, true, undefined, ajaxTarget, ajaxhref);
            return false;
        };
        AjaxRedirect.prototype.go = function (url, trigger, isBack, keepScroll, addToHistory, onComplete, ajaxTarget, ajaxhref) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger) {
                trigger = $(window);
            }
            if (ajaxTarget && trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") {
                return;
            }
            url = this.url.effectiveUrlProvider(url, trigger);
            if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
                url = url.substring(this.url.baseContentUrl.length).substring(3);
            }
            this.isAjaxRedirecting = true;
            // this.serverInvoker.isAwaitingAjaxResponse = true;
            var requestCounter = ++this.requestCounter;
            // if (window.stop) {
            //     window.stop();
            // } else if (document.execCommand !== undefined) {
            //     document.execCommand("Stop", false);
            // }
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.waiting.show(false, false);
            $.ajax({
                url: url,
                type: "GET",
                xhrFields: { withCredentials: true },
                success: function (response) {
                    if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                    }
                    else if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory && !window.isModal()) {
                            var title = $("#page_meta_title").val();
                            var addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                _this.onRedirected(title, addressBar);
                            }
                            catch (error) {
                                addressBar = _this.url.makeAbsolute(_this.url.baseContentUrl, "/##" + addressBar);
                                history.pushState({}, title, addressBar);
                            }
                        }
                    }
                    // this.serverInvoker.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    _this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null, ajaxTarget, ajaxhref);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
                    if (onComplete) {
                        onComplete(true);
                    }
                },
                error: function (response) {
                    if (onComplete) {
                        onComplete(false);
                    }
                    if (_this.requestCounter === requestCounter) {
                        _this.onRedirectionFailed(url, response);
                    }
                },
                complete: function (response) { return _this.waiting.hide(); },
            });
            return false;
        };
        return AjaxRedirect;
    }());
    exports.default = AjaxRedirect;
});
define("olive/components/alert", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Alert = /** @class */ (function () {
        function Alert() {
        }
        Alert.prototype.enableAlert = function () {
            var _this = this;
            var w = window;
            w.alert = function (text, callback) { return _this.alert(text, null, callback); };
        };
        Alert.prototype.alert = function (text, style, callback) {
            if (text === undefined)
                text = "";
            text = text.trim();
            if (text.indexOf("<") != 0) {
                text = text.replace(/\r/g, "<br />");
                alertify.alert(text, callback, style);
            }
            else {
                alertify.alert('', callback, style);
                $('.alertify-message').empty().append($.parseHTML(text));
            }
        };
        Alert.prototype.confirm = function (text, style, callback) {
            if (text === undefined)
                text = "";
            text = text.trim();
            if (text.indexOf("<") != 0) {
                text = text.replace(/\r/g, "<br />");
                alertify.confirm(text, callback, style);
            }
            else {
                alertify.confirm('', callback, style);
                $('.alertify-message').empty().append($.parseHTML(text));
            }
        };
        Alert.prototype.alertUnobtrusively = function (message, style) {
            alertify.log(message, style);
        };
        return Alert;
    }());
    exports.default = Alert;
});
define("olive/plugins/select", ["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Select = /** @class */ (function () {
        function Select() {
        }
        //https://developer.snapappointments.com/bootstrap-select/
        Select.prototype.enableEnhance = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        Select.prototype.enhance = function (selectControl) {
            selectControl.selectpicker();
        };
        Select.prototype.replaceSource = function (controlId, items) {
            var $control = $('#' + controlId);
            if ($control.is("select")) {
                $control.empty();
                for (var i = 0; i < items.length; i++) {
                    $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
                }
            }
            else {
                console.log("Unable to replace list items");
            }
        };
        return Select;
    }());
    exports.default = Select;
});
define("olive/components/modal", ["require", "exports", "olive/components/crossDomainEvent"], function (require, exports, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModalHelper = void 0;
    var ModalHelper = /** @class */ (function () {
        function ModalHelper(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.current = null;
            this.currentModal = null;
            this.isAjaxModal = false;
            this.isClosingModal = false;
        }
        ModalHelper.prototype.enableLink = function (selector) {
            var _this = this;
            selector.off("click.open-modal").on("click.open-modal", function (e) {
                _this.close();
                if ($(e.currentTarget).attr("data-mode") === "iframe") {
                    _this.openiFrame(e);
                }
                else {
                    setTimeout(function () { return _this.open(e); }, 0);
                }
                return false;
            });
        };
        ModalHelper.prototype.initialize = function () {
            var _this = this;
            crossDomainEvent_1.default.handle("set-iframe-height", function (x) { return _this.setIFrameHeight(x); });
            crossDomainEvent_1.default.handle("close-modal", function (x) { return _this.close(); });
            this.responseProcessor.processCompleted.handle(function () { return _this.tryOpenFromUrl(); });
            window.isModal = function () {
                try {
                    if (_this.isAjaxModal) {
                        return true;
                    }
                    return $("myModal").length > 0;
                    // return window.self !== window.parent;
                }
                catch (e) {
                    return true;
                }
            };
        };
        ModalHelper.prototype.closeMe = function () {
            if (!this.isAjaxModal) {
                crossDomainEvent_1.default.raise(parent, "close-modal");
            }
            this.close();
            $("body > .tooltip").each(function (index, elem) {
                if ($("[aria-discribedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            return true;
        };
        ModalHelper.prototype.close = function () {
            this.isClosingModal = true;
            var hasModalContent = this.current;
            if (this.current) {
                if (this.currentModal.shouldKeepScroll()) {
                    $(window).scrollTop(this.currentModal.scrollPosition);
                }
                var onClosingEvent = new CustomEvent("onClosingEvent");
                this.current[0].dispatchEvent(onClosingEvent);
                this.current.modal("hide");
                if (this.currentModal.onClose == null && this.currentModal.onClose == undefined) {
                    this.current.remove();
                    this.current = null;
                    this.currentModal = null;
                }
            }
            $("body > .tooltip").each(function (index, elem) {
                if ($("[aria-describedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            this.isClosingModal = false;
            this.isAjaxModal = false;
            // remove modal query string
            var currentPath = this.url.removeQuery(this.url.current(), "_modal");
            currentPath = this.url.removeQuery(currentPath, "_iframe");
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            if (hasModalContent) {
                history.pushState({}, "", currentPath);
                document.title = $("#page_meta_title").val();
            }
            return true;
        };
        ModalHelper.prototype.setIFrameHeight = function (arg) {
            try {
                var iframe = $("iframe").filter(function (_, f) { return f.src === arg.url; });
                if (iframe.attr("data-has-explicit-height") === "true") {
                    return;
                }
                iframe.height(arg.height + 30); // we have 30px padding
            }
            catch (error) {
                console.error(error);
            }
        };
        ModalHelper.prototype.enableEnsureHeight = function (selector) {
            var _this = this;
            selector.off("click.tab-toggle").on("click.tab-toggle", function () { return _this.ensureHeight(); });
        };
        ModalHelper.prototype.ensureHeight = function () {
            var _this = this;
            setTimeout(function () { return _this.adjustHeight(); }, 1);
        };
        ModalHelper.prototype.adjustHeight = function (overflow) {
            if (window.isModal()) {
                crossDomainEvent_1.default.raise(parent, "set-iframe-height", {
                    url: window.location.href,
                    height: document.body.scrollHeight + (overflow || 0),
                });
            }
        };
        ModalHelper.prototype.expandToFitPicker = function (target) {
            var datepicker = $(target.currentTarget).siblings(".bootstrap-datetimepicker-widget");
            if (datepicker.length === 0) {
                this.adjustHeight();
                return;
            }
            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustHeight(overflow);
        };
        ModalHelper.prototype.ensureNonModal = function () {
            if (window.isModal()) {
                parent.window.location.href = location.href;
            }
        };
        ModalHelper.prototype.tryOpenFromUrl = function () {
            if (this.url.getQuery("_modal") && $(".modal-dialog").length === 0) {
                this.openWithUrl();
            }
        };
        ModalHelper.prototype.changeUrl = function (url, iframe) {
            if (iframe === void 0) { iframe = false; }
            var currentPath = this.url.removeQuery(this.url.current(), "_modal");
            currentPath = this.url.removeQuery(currentPath, "_iframe");
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            if (this.url.isAbsolute(url)) {
                var pathArray = url.split("/").splice(3);
                url = pathArray.join("/");
            }
            var modalUrl = this.url.addQuery(currentPath, "_modal", encodeURIComponent(url));
            if (iframe) {
                modalUrl = this.url.addQuery(modalUrl, "_iframe", "true");
            }
            history.pushState({}, "", modalUrl);
        };
        ModalHelper.prototype.isOrGoingToBeModal = function () {
            return window.isModal() || !!this.url.getQuery("_modal");
        };
        ModalHelper.prototype.open = function (event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).open();
        };
        ModalHelper.prototype.openiFrame = function (event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).openiFrame();
        };
        ModalHelper.prototype.openWithUrl = function () {
            // Prevent XSS
            var modalQuery = this.url.getQuery("_modal").toLowerCase();
            if (modalQuery.contains("javascript:")) {
                alert("Dangerous script detected!!! Request is now aborted!");
                return;
            }
            // Prevent Open Redirection
            if (modalQuery.indexOf("http://") === 0 || modalQuery.indexOf("https://") === 0) {
                var newHostName = new URL(modalQuery).hostname;
                var currentHostName = new URL(this.url.current()).hostname;
                if (newHostName !== currentHostName) {
                    alert("Dangerous script detected!!! Request is now aborted!");
                    return;
                }
            }
            if (this.url.getQuery("_iframe") === "true") {
                new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).openiFrame(false);
            }
            else {
                new Modal(this.url, this.ajaxRedirect, this, null, this.url.getQuery("_modal")).open(false);
            }
        };
        return ModalHelper;
    }());
    exports.ModalHelper = ModalHelper;
    var Modal = /** @class */ (function () {
        function Modal(urlService, ajaxRedirect, helper, event, targeturl, opt) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.isOpening = false;
            this.modalOptions = {};
            var target = event ? $(event.currentTarget) : null;
            this.opener = target;
            this.url = targeturl ? targeturl : target.attr("href");
            this.rawUrl = this.url;
            this.url = this.urlService.effectiveUrlProvider(this.url, target);
            var options = opt ? opt : (target ? target.attr("data-modal-options") : null);
            if (options) {
                this.modalOptions = JSON.safeParse(options);
            }
        }
        Modal.prototype.onComplete = function (success) {
        };
        Modal.prototype.onClose = function () {
            this.onClose = null;
            $(this.helper.current).modal('hide');
        };
        Modal.prototype.open = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            this.isOpening = true;
            this.helper.isAjaxModal = true;
            if (this.helper.current) {
                if (this.helper.close() === false) {
                    return false;
                }
            }
            this.helper.current = $(this.getModalTemplateForAjax(this.modalOptions));
            this.helper.currentModal = this;
            this.scrollPosition = $(window).scrollTop();
            this.ajaxRedirect.go(this.url, $(this.helper.current).find("main"), true, this.shouldKeepScroll(), changeUrl, function (success) {
                if (_this.onComplete != null && _this.onComplete != undefined)
                    _this.onComplete(success);
                if (changeUrl && window.isModal()) {
                    _this.helper.changeUrl(_this.url);
                }
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hide.bs.modal", function () {
                if (_this.onClose != null && _this.onClose != undefined) {
                    _this.onClose();
                    return false;
                }
                crossDomainEvent_1.default.raise(window.self, "close-modal");
                return true;
            });
        };
        Modal.prototype.openiFrame = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            this.isOpening = true;
            this.helper.isAjaxModal = false;
            if (this.helper.current) {
                if (this.helper.close() === false) {
                    return false;
                }
            }
            this.helper.current = $(this.getModalTemplateForiFrame(this.modalOptions));
            this.helper.currentModal = this;
            this.scrollPosition = $(window).scrollTop();
            if (true /* TODO: Change to if Internet Explorer only */) {
                this.helper.current.removeClass("fade");
            }
            var frame = this.helper.current.find("iframe");
            var url = this.url;
            frame.attr("src", url).on("load", function (e) {
                _this.isOpening = false;
                if (changeUrl) {
                    _this.helper.changeUrl(url, true);
                }
                _this.helper.current.find(".modal-body .text-center").remove();
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hidden.bs.modal", function () {
                crossDomainEvent_1.default.raise(window.self, "close-modal");
            });
        };
        Modal.prototype.shouldKeepScroll = function () {
            if (this.modalOptions) {
                if (this.modalOptions.keepScroll) {
                    return this.modalOptions.keepScroll;
                }
            }
            return true;
        };
        Modal.prototype.getModalTemplateForAjax = function (options) {
            var modalDialogStyle = "";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + "; max-width: none;";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                }
            }
            return ("<div class='modal' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
           aria-hidden='true'>\
              <div class='modal-dialog' style='" + modalDialogStyle + "'>\
              <div class='modal-content' >\
              <div class='modal-header'>\
                  <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                      <i class='fa fa-times-circle'></i>\
                  </button>\
              </div>\
              <div class='modal-body'>\
                  <main></main>\
              </div>\
          </div></div></div>");
        };
        Modal.prototype.getModalTemplateForiFrame = function (options) {
            var modalDialogStyle = "";
            var iframeStyle = "width:100%; border:0;";
            var iframeAttributes = "";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + ";";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                    iframeStyle += "height:" + options.height + ";";
                    iframeAttributes += " data-has-explicit-height='true'";
                }
            }
            return "<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
         aria-hidden='true'>\
                    <div class='modal-dialog' style='" + modalDialogStyle + "'>\
            <div class='modal-content'>\
            <div class='modal-header'>\
                <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                    <i class='fa fa-times-circle'></i>\
                </button>\
            </div>\
            <div class='modal-body'>\
                <div class='row text-center'><i class='fa fa-spinner fa-spin fa-2x'></i></div>\
                <iframe style='" + iframeStyle + "' " + iframeAttributes + "></iframe>\
            </div>\
        </div></div></div>";
        };
        return Modal;
    }());
    exports.default = Modal;
});
define("olive/components/validate", ["require", "exports", "olive/config"], function (require, exports, config_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Validate = /** @class */ (function () {
        function Validate(alert, responseProcessor) {
            this.alert = alert;
            this.responseProcessor = responseProcessor;
        }
        Validate.prototype.configure = function () {
            var methods = $.validator.methods;
            var format = config_1.default.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element)) {
                    return true;
                }
                return moment(value, format).isValid();
            };
            var originalNumberMehtod = methods.number;
            var originalMinMehtod = methods.min;
            var originalMaxMehtod = methods.max;
            var originalRangeMehtod = methods.range;
            var clearMaskedNumber = function (value) { return value.replace(/,/g, ""); };
            methods.number = function (value, element) {
                return originalNumberMehtod.call(this, value, element);
            };
            methods.min = function (value, element, param) {
                return originalMinMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.max = function (value, element, param) {
                return originalMaxMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            methods.range = function (value, element, param) {
                return originalRangeMehtod.call(this, clearMaskedNumber(value), element, param);
            };
            // TODO: datetime, time
        };
        Validate.prototype.initialize = function () {
            var _this = this;
            this.responseProcessor.subformChanged.handle(function (data) { return _this.reloadRules(data.trigger.parents("form")); });
        };
        /// TODO: this method is obsolete and DI should use instead.
        Validate.prototype.setTooltipOptions = function (options) {
            console.warn("MultiSelect.setOptions is obsolete and will be removed in next version.");
            this.tooltipOptions = options;
        };
        Validate.prototype.validateForm = function (trigger) {
            if (!this.needsValidation(trigger)) {
                return true;
            }
            var form = this.getForm(trigger);
            var validator = this.getValidator(trigger, form);
            this.extendValidatorSettings(validator, trigger);
            if (!validator.form()) {
                this.handleInvalidForm(validator, form, trigger);
                return false;
            }
            return true;
        };
        Validate.prototype.reloadRules = function (form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            // $.validator.unobtrusive.parse(form);
        };
        Validate.prototype.removeTooltipsRelatedTo = function (parent) {
            parent.find("[aria-describedby]").each(function (_, elem) {
                var id = $(elem).attr("aria-describedby");
                $("body > #" + id + ".tooltip").tooltip("hide");
            });
        };
        Validate.prototype.needsValidation = function (trigger) {
            return !trigger.is("[formnovalidate]");
        };
        Validate.prototype.getForm = function (trigger) {
            return trigger.closest("form");
        };
        Validate.prototype.getValidator = function (trigger, form) {
            return form.validate();
        };
        Validate.prototype.extendValidatorSettings = function (validator, trigger) {
            $.extend(validator.settings, {
                tooltip_options: { _all_: this.tooltipOptions },
            });
        };
        Validate.prototype.focusOnInvalid = function (validator, form, trigger) {
            validator.focusInvalid();
        };
        Validate.prototype.showAdditionalErrors = function (validator) {
            var errorMessage = "";
            $.each(validator.errorList, function (_, item) {
                if (!$(".tooltip:contains('" + item.message + "')")) {
                    errorMessage += item.message + "<br/>";
                }
            });
            if (errorMessage.length > 0) {
                this.alert.alert(errorMessage, "error");
            }
        };
        Validate.prototype.handleMessageBoxStyle = function (validator, form, trigger) {
            var _this = this;
            var alertUntyped = alert;
            if (form.is("[data-validation-style*=message-box]")) {
                alertUntyped(validator.errorList.map(function (err) { return err.message; }).join("\r\n"), function () { setTimeout(function () { return _this.focusOnInvalid(validator, form, trigger); }, 0); });
            }
        };
        Validate.prototype.handleInvalidForm = function (validator, form, trigger) {
            this.handleMessageBoxStyle(validator, form, trigger);
            this.focusOnInvalid(validator, form, trigger);
            this.showAdditionalErrors(validator);
        };
        return Validate;
    }());
    exports.default = Validate;
});
define("olive/components/form", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Form = /** @class */ (function () {
        function Form(url, validate, waiting, ajaxRedirect) {
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.currentRequestUrlProvider = function () { return window.location.pathAndQuery(); };
        }
        Form.prototype.enableDefaultButtonKeyPress = function (selector) {
            var _this = this;
            selector.off("keypress.default-button").on("keypress.default-button", function (e) { return _this.DefaultButtonKeyPress(e); });
        };
        Form.prototype.enablecleanUpNumberField = function (selector) {
            var _this = this;
            selector.off("blur.cleanup-number")
                .on("blur.cleanup-number", function (e) { return _this.cleanUpNumberField($(e.currentTarget)); });
        };
        Form.prototype.enablesubmitCleanGet = function (selector) {
            var _this = this;
            selector.off("submit.clean-up").on("submit.clean-up", function (e) { return _this.submitCleanGet(e); });
        };
        Form.prototype.getCleanFormData = function (form) {
            var result = [];
            var disabledOnes = form.find(":disabled").removeAttr("disabled");
            var items = form.serializeArray();
            disabledOnes.attr("disabled", "disabled");
            var groupedByKeys = Array.groupBy(items, function (i) { return i.name.toLowerCase(); });
            var numericInputs = new Array();
            form.find("[data-val-range]").map(function (i, e) { return numericInputs.push(e.getAttribute("name")); });
            for (var i in groupedByKeys) {
                if (groupedByKeys.hasOwnProperty(i)) {
                    var group = groupedByKeys[i];
                    if (typeof (group) === "function") {
                        continue;
                    }
                    var key = group[0].name;
                    var values = group.map(function (item) { return item.value; }).filter(function (v) { return v; });
                    if (this.ignoreFormDataInput(key, values)) {
                        continue;
                    }
                    // Skip numeric masks
                    if (numericInputs.indexOf(key) >= 0 && values[0]) {
                        values[0] = values[0].replace(",", "");
                    }
                    // Fix for MVC checkboxes:
                    if ($("input[name='" + key + "']", form).is(":checkbox") && values.length === 2 && values[1] === "false"
                        && (values[0] === "true" || values[0] === "false")) {
                        values.pop();
                    }
                    result.push({ name: key, value: values.join("|") });
                }
            }
            // Fix for multi-select:
            // If a multi-select control has no value, we should return empty value for it.
            // The default serializeArray() function just ignores it.
            $("select[multiple]", form).each(function (i, e) {
                var key = $(e).attr("name");
                if (result.filter(function (v) { return v.name === key; }).length === 0) {
                    result.push({ name: key, value: "" });
                }
            });
            return result;
        };
        Form.prototype.ignoreFormDataInput = function (inputName, values) {
            return false;
        };
        Form.prototype.cleanJson = function (str) {
            return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
        };
        Form.prototype.getPostData = function (trigger) {
            var form = trigger.closest("[data-module]");
            if (!form.is("form")) {
                form = $("<form />").append(form.clone(true));
            }
            var data = this.getCleanFormData(form);
            // If it's master-details, then we need the index.
            var subFormContainer = trigger.closest(".subform-item");
            if (subFormContainer) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform")
                        .find(".subform-item").index(subFormContainer).toString(),
                });
            }
            data.push({ name: "current.request.url", value: this.currentRequestUrlProvider() });
            return data;
        };
        Form.prototype.DefaultButtonKeyPress = function (event) {
            if (event.which === 13) {
                var target = $(event.currentTarget);
                var button = target.closest("[data-module]").find("[default-button]:first"); // Same module
                if (button.length === 0) {
                    button = $("[default-button]:first");
                } // anywhere
                button.click();
                return false;
            }
            else {
                return true;
            }
        };
        Form.prototype.cleanUpNumberField = function (field) {
            var domElement = field.get(0);
            field.val(field.val().replace(/[^\d.-]/g, ""));
        };
        Form.prototype.submitCleanGet = function (event) {
            var _this = this;
            var form = $(event.currentTarget);
            if (this.validate.validateForm(form) === false) {
                this.waiting.hide();
                return false;
            }
            var formData = this.getCleanFormData(form).filter(function (item) { return item.name !== "__RequestVerificationToken"; });
            var url = this.url.removeEmptyQueries(form.attr("action"));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = _this.url.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    var value = encodeURIComponent(item.value);
                    url = this.url.updateQuery(url, item.name, value);
                }
                url = this.url.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]")) {
                    var link = $(event.currentTarget);
                    if (link != undefined && link != null) {
                        var ajaxTarget = link.attr("ajax-target");
                        var ajaxhref = link.attr("href");
                        this.ajaxRedirect.go(url, form, false, false, true, undefined, ajaxTarget, ajaxhref);
                    }
                    else {
                        this.ajaxRedirect.go(url, form, false, false, true);
                    }
                }
                else {
                    location.href = url;
                }
            }
            catch (error) {
                console.error(error);
                alert(error);
            }
            return false;
        };
        return Form;
    }());
    exports.default = Form;
});
define("olive/mvc/standardAction", ["require", "exports", "olive/components/crossDomainEvent"], function (require, exports, crossDomainEvent_2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var StandardAction = /** @class */ (function () {
        function StandardAction(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, serviceLocator) {
            this.alert = alert;
            this.form = form;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.select = select;
            this.modalHelper = modalHelper;
            this.serviceLocator = serviceLocator;
        }
        StandardAction.prototype.initialize = function () {
            var _this = this;
            this.responseProcessor.nothingFoundToProcess.handle(function (data) { return _this.runAll(data.response, data.trigger); });
        };
        StandardAction.prototype.runStartup = function (container, trigger, stage) {
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
                    var currentUrl = document.URL;
                    if (currentUrl != undefined && currentUrl != null && currentUrl.contains("/hub/project/")) {
                        if (stringResult_1.contains("[{\"ServiceKey\":\"hub\",\"Function\":\"go\",\"Arguments\":[\"[dashboard]/")) {
                            stringResult_1 = stringResult_1.replace("true", "false");
                        }
                    }
                    actions.push(stringResult_1);
                }
            });
            for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                var action = actions_1[_i];
                if (action && (action.Stage || "Init") == stage)
                    this.runAll(JSON.safeParse(action), trigger);
            }
        };
        StandardAction.prototype.runAll = function (actions, trigger) {
            if (trigger === void 0) { trigger = null; }
            for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                var action = actions_2[_i];
                if (!this.run(action, trigger))
                    return;
            }
        };
        StandardAction.prototype.run = function (action, trigger) {
            var _this = this;
            if (action.Notify || action.Notify == "")
                this.notify(action, trigger);
            else if (action.Script)
                eval(action.Script);
            else if (action.ServiceConfigurationUrl)
                this.loadServiceAfterConfiguration(action.ServiceConfigurationUrl, action.ServiceKey, action.Function, action.Arguments);
            else if (action.ServiceKey && action.Function == "go") {
                action.Arguments[2] = trigger;
                this.loadService(action.ServiceKey, action.Function, action.Arguments);
            }
            else if (action.ServiceKey)
                this.loadService(action.ServiceKey, action.Function, action.Arguments);
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
                        _this.responseProcessor.processAjaxResponse(response, opener_1.closest("[data-module]"), opener_1, null, null, null);
                    });
                }
                else {
                    crossDomainEvent_2.default.raise(parent, 'refresh-page');
                }
            }
            else if (action.BrowserAction == "CloseModalRefreshParent") {
                window.page.modal.closeMe();
                crossDomainEvent_2.default.raise(parent, 'refresh-page');
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
                this.redirect(action, trigger);
            else
                alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
            return true;
        };
        StandardAction.prototype.notify = function (action, trigger) {
            if (action.Obstruct == false)
                this.alert.alertUnobtrusively(action.Notify, action.Style);
            else
                this.alert.alert(action.Notify, action.Style);
        };
        StandardAction.prototype.redirect = function (action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && window.isModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal({ currentTarget: trigger }, action.Redirect, null);
            else if (action.Target && action.Target != '')
                window.open(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true) {
                var link = $(action.Target);
                if (link != undefined && link != null) {
                    var ajaxTarget = link.attr("ajax-target");
                    var ajaxhref = link.attr("href");
                    this.ajaxRedirect.go(action.Redirect, trigger, false, false, true, undefined, ajaxTarget, ajaxhref);
                }
                else {
                    this.ajaxRedirect.go(action.Redirect, trigger, false, false, true);
                }
            }
            else
                location.replace(action.Redirect);
        };
        StandardAction.prototype.openModal = function (event, url, options) {
            var _this = this;
            this.modalHelper.close();
            setTimeout(function () { return _this.modalHelper.open(event, url, options); }, 0);
        };
        StandardAction.prototype.loadServiceAfterConfiguration = function (serviceConfigurationUrl, key, func, args) {
            var _this = this;
            window.requirejs([serviceConfigurationUrl], function () {
                _this.loadService(key, func, args);
            });
        };
        StandardAction.prototype.loadService = function (key, func, args) {
            //this.serviceLocator.getService<any>(key)[func].Apply({}, args);
            var obj = this.serviceLocator.getService(key);
            var method = obj[func];
            method.apply(obj, args);
        };
        return StandardAction;
    }());
    exports.default = StandardAction;
});
define("olive/mvc/serverInvoker", ["require", "exports", "olive/config"], function (require, exports, config_2) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ServerInvoker = /** @class */ (function () {
        function ServerInvoker(url, validate, waiting, form, responseProcessor) {
            var _this = this;
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.form = form;
            this.responseProcessor = responseProcessor;
            this.isAwaitingAjaxResponse = false;
            this.onAjaxResponseError = function (jqXHR, status, error) {
                _this.waiting.hide();
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
        }
        ServerInvoker.prototype.enableInvokeWithAjax = function (selector, event, attrName) {
            var _this = this;
            selector.off(event).on(event, function (e) {
                var trigger = $(e.currentTarget);
                var url = _this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
                _this.invokeWithAjax(e, url, false);
                return false;
            });
        };
        ServerInvoker.prototype.enableinvokeWithPost = function (selector) {
            var _this = this;
            selector.off("click.formaction").on("click.formaction", function (e) { return _this.invokeWithPost(e); });
        };
        ServerInvoker.prototype.invokeWithPost = function (event) {
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
        ServerInvoker.prototype.invokeWithAjax = function (event, actionUrl, syncCall) {
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
            var disableToo = config_2.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse = true;
            actionUrl = this.url.effectiveUrlProvider(actionUrl, trigger);
            // If the request is cross domain, jquery won't send the header: X-Requested-With
            data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });
            var scrollPosition = $(window).scrollTop();
            var context = {
                trigger: trigger,
                containerModule: containerModule,
                url: actionUrl,
            };
            this.onInvocation(event, context);
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                xhrFields: { withCredentials: true },
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { $(".tooltip").remove(); _this.waiting.hide(); _this.responseProcessor.processAjaxResponse(result, containerModule, trigger, null, null, null); },
                error: this.onAjaxResponseError,
                statusCode: {
                    401: function (data) {
                        _this.url.onAuthenticationFailed();
                    }
                },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse = false;
                    _this.onInvocationCompleted(event, context);
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
                    _this.onInvocationProcessed(event, context);
                }
            });
            return false;
        };
        ServerInvoker.prototype.onInvocation = function (event, context) {
        };
        ServerInvoker.prototype.onInvocationProcessed = function (event, context) {
        };
        ServerInvoker.prototype.onInvocationCompleted = function (event, context) {
        };
        return ServerInvoker;
    }());
    exports.default = ServerInvoker;
});
define("olive/mvc/windowEx", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var WindowEx = /** @class */ (function () {
        function WindowEx(modalHelper, ajaxRedirect) {
            this.modalHelper = modalHelper;
            this.ajaxRedirect = ajaxRedirect;
        }
        WindowEx.prototype.enableBack = function (selector) {
            var _this = this;
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return _this.back(e); });
        };
        WindowEx.prototype.back = function (event) {
            if (this.modalHelper.isOrGoingToBeModal())
                window.location.reload();
            else {
                if (this.ajaxRedirect.ajaxChangedUrl == 0)
                    return;
                this.ajaxRedirect.ajaxChangedUrl--;
                var link = $(event.currentTarget);
                if (link != undefined && link != null) {
                    var ajaxTarget = link.attr("ajax-target");
                    var ajaxhref = link.attr("href");
                    this.ajaxRedirect.go(location.href, null, false, false, true, undefined, ajaxTarget, ajaxhref);
                }
                else {
                    this.ajaxRedirect.go(location.href, null, true, false, false);
                }
            }
        };
        return WindowEx;
    }());
    exports.default = WindowEx;
});
define("olive/extensions/jQueryExtensions", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUniqueSelector = exports.raiseEvent = exports.enableValidateForCheckboxList = exports.bindFirst = exports.screenOffset = exports.enableValidateForTimePicker = void 0;
    var enableValidateForTimePicker = function () {
        $.validator.addMethod("time", function (value, element, params) {
            return this.optional(element) || /^([01]\d|2[0-3]|[0-9])(:[0-5]\d){1,2}$/.test(value);
        }, 'Please enter a valid time, between 00:00 and 23:59');
        $.validator.unobtrusive.adapters.addBool("time");
    };
    exports.enableValidateForTimePicker = enableValidateForTimePicker;
    function screenOffset() {
        var documentOffset = this.first().offset();
        return {
            top: documentOffset.top - $(window).scrollTop(),
            left: documentOffset.left - $(window).scrollLeft()
        };
    }
    exports.screenOffset = screenOffset;
    // [name] is the name of the event "click", "mouseover", .. 
    // same as you'd pass it to bind()
    // [fn] is the handler function
    function bindFirst(name, fn) {
        // bind as you normally would
        // don't want to miss out on any jQuery magic
        this.bind(name, fn);
        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        var jq = $;
        var eventsData = jq._data(this.get(0), "events");
        if (eventsData) {
            var handlers = eventsData[name.split('.')[0]];
            // take out the handler we just inserted from the end
            var handler = handlers.pop();
            // move it at the beginning
            handlers.splice(0, 0, handler);
        }
        return this;
    }
    exports.bindFirst = bindFirst;
    ;
    //export function clone(original) {
    //    var result = original.apply(this, arguments),
    //        my_textareas = this.find('textarea').add(this.filter('textarea')),
    //        result_textareas = result.find('textarea').add(result.filter('textarea')),
    //        my_selects = this.find('select').add(this.filter('select')),
    //        result_selects = result.find('select').add(result.filter('select'));
    //    for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
    //    for (var i = 0, l = my_selects.length; i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;
    //    return result;
    //}
    var enableValidateForCheckboxList = function () {
        $.validator.unobtrusive.adapters.add("selection-required", function (options) {
            if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
                var $element = $(options.element);
                options.rules["required"] = true;
                options.messages["required"] = $element.data('valRequired');
            }
        });
    };
    exports.enableValidateForCheckboxList = enableValidateForCheckboxList;
    var raiseEvent = function (event, owner, data) {
        var result = true;
        if (owner.event.hasOwnProperty(event)) {
            owner.event[event].forEach(function (handler) {
                var res = handler(data || {});
                if (res === false)
                    result = false;
            });
        }
        return result;
    };
    exports.raiseEvent = raiseEvent;
    function getUniqueSelector() {
        if (this.length != 1)
            throw 'Requires one element.';
        var path, node = this;
        while (node.length) {
            var realNode = node[0];
            var name_1 = realNode.localName;
            if (!name_1)
                break;
            name_1 = name_1.toLowerCase();
            var parent_1 = node.parent();
            var siblings = parent_1.children(name_1);
            if (siblings.length > 1) {
                name_1 += ':eq(' + siblings.index(realNode) + ')';
            }
            path = name_1 + (path ? '>' + path : '');
            node = parent_1;
        }
        return path;
    }
    exports.getUniqueSelector = getUniqueSelector;
});
define("olive/extensions/systemExtensions", ["require", "exports", "olive/extensions/jQueryExtensions"], function (require, exports, jq) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SystemExtensions = /** @class */ (function () {
        function SystemExtensions() {
        }
        SystemExtensions.initialize = function () {
            window.download = this.download;
            Array.groupBy = this.groupBy;
            JSON.safeParse = this.safeParse;
            this.extendString();
            window.location.pathAndQuery = function () { return window.location.pathname + window.location.search; };
            jq.enableValidateForCheckboxList();
            jq.enableValidateForTimePicker();
            $.fn.extend({
                screenOffset: jq.screenOffset,
                bindFirst: jq.bindFirst,
                //clone: jq.clone,
                raiseEvent: jq.raiseEvent,
                getUniqueSelector: jq.getUniqueSelector
            });
        };
        SystemExtensions.extend = function (type, name, implementation) {
            var proto = type.prototype;
            if (implementation.length == 0)
                throw new Error("extend function needs at least one argument.");
            else if (implementation.length == 1)
                proto[name] = function () { return implementation(this); };
            else if (implementation.length == 2)
                proto[name] = function (arg) { return implementation(this, arg); };
            else if (implementation.length == 3)
                proto[name] = function (a1, a2) { return implementation(this, a1, a2); };
        };
        SystemExtensions.extendString = function () {
            this.extend(String, "endsWith", function (instance, searchString) {
                var position = instance.length - searchString.length;
                var lastIndex = instance.indexOf(searchString, position);
                return lastIndex !== -1 && lastIndex === position;
            });
            this.extend(String, "htmlEncode", function (instance) {
                var a = document.createElement('a');
                a.appendChild(document.createTextNode(instance));
                return a.innerHTML;
            });
            this.extend(String, "htmlDecode", function (instance) {
                var a = document.createElement('a');
                a.innerHTML = instance;
                return a.textContent;
            });
            this.extend(String, "startsWith", function (instance, text) { return instance.indexOf(text) === 0; });
            this.extend(String, "withPrefix", function (instance, prefix) { return instance.startsWith(prefix) === false ? prefix + instance : instance; });
            this.extend(String, "trimText", function (instance, text) { return instance.trimStart(text).trimEnd(text); });
            this.extend(String, "trimStart", function (instance, text) { return instance.startsWith(text) ? instance.slice(text.length) : instance; });
            this.extend(String, "trimEnd", function (instance, text) { return instance.endsWith(text) ? instance.slice(0, instance.lastIndexOf(text)) : instance; });
            this.extend(String, "contains", function (instance, text) { return instance.indexOf(text) > -1; });
        };
        SystemExtensions.safeParse = function (data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                console.log('Cannot parse this data to Json: ');
                throw error;
            }
        };
        SystemExtensions.download = function (url) {
            $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
        };
        SystemExtensions.groupBy = function (array, groupFunction) {
            var groups = {};
            array.forEach(function (o) {
                var group = JSON.stringify(groupFunction(o));
                groups[group] = groups[group] || [];
                groups[group].push(o);
            });
            return Object.keys(groups).map(function (g) { return groups[g]; });
        };
        return SystemExtensions;
    }());
    exports.default = SystemExtensions;
});
define("olive/components/sorting", ["require", "exports", "jquery-sortable"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Sorting = /** @class */ (function () {
        function Sorting(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        Sorting.prototype.enableDragSort = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.DragSort($(e)); });
        };
        Sorting.prototype.enablesetSortHeaderClass = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.setSortHeaderClass($(e)); });
        };
        Sorting.prototype.enableAjaxSorting = function (selector) {
            var _this = this;
            selector.off("click.ajax-sorting").on("click.ajax-sorting", function (e) { return _this.AjaxSorting(e); });
        };
        Sorting.prototype.AjaxSorting = function (event) {
            var button = $(event.currentTarget);
            var sort = button.attr("data-sort");
            var key = "s";
            if (sort.split("=").length > 1) {
                key = sort.split("=")[0];
                sort = sort.split("=")[1];
            }
            var input = $("[name='" + key + "']");
            if (input.val() === sort) {
                sort += ".DESC";
            }
            input.val(sort);
        };
        Sorting.prototype.setSortHeaderClass = function (thead) {
            var currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
            if (currentSort === "") {
                return;
            }
            var sortKey = currentSort.replace(".DESC", "").replace(".ASC", "");
            var currentThead = $("[data-sort='" + sortKey + "']");
            if (currentSort.contains(".DESC")) {
                currentThead.removeClass("sort-ascending");
                currentThead.addClass("sort-descending");
            }
            else {
                currentThead.removeClass("sort-descending");
                currentThead.addClass("sort-ascending");
            }
            currentThead.append("<i />");
        };
        Sorting.prototype.DragSort = function (container) {
            var _this = this;
            var itemsSelector = "> li";
            var config = {
                handle: "[data-sort-item]",
                containment: "parent",
                axis: "y",
                tolerance: "pointer",
                scroll: true,
                items: itemsSelector,
                helper: function (e, ui) {
                    // prevent TD collapse during drag
                    ui.children().each(function (i, c) { return $(c).width($(c).width()); });
                    return ui;
                },
                stop: function (e, ui) {
                    $(ui).children().removeAttr("style");
                    container.find(itemsSelector).children().removeAttr("style");
                    var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                    var handle = ui.item.find("[data-sort-item]");
                    var actionUrl = handle.attr("data-sort-action");
                    actionUrl = _this.url.addQuery(actionUrl, "drop-before", dropBefore);
                    actionUrl = _this.url.effectiveUrlProvider(actionUrl, handle);
                    _this.serverInvoker.invokeWithAjax({ currentTarget: handle.get(0) }, actionUrl);
                },
            };
            if (container.is("tbody")) {
                config.items = "> tr";
            }
            else if (container.is(".r-grid-body")) {
                config.items = "> .r-grid-row";
                delete config.axis;
            }
            container.sortable(config);
        };
        return Sorting;
    }());
    exports.default = Sorting;
});
define("olive/components/paging", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Paging = /** @class */ (function () {
        function Paging(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        Paging.prototype.enableOnSizeChanged = function (selector) {
            var _this = this;
            selector.off("change.pagination-size").on("change.pagination-size", function (e) { return _this.onSizeChanged(e); });
        };
        Paging.prototype.enableWithAjax = function (selector) {
            var _this = this;
            selector.off("click.ajax-paging").on("click.ajax-paging", function (e) { return _this.withAjax(e); });
        };
        Paging.prototype.onSizeChanged = function (event) {
            var form = $(event.currentTarget).closest("form");
            if (form.length === 0)
                return;
            if (form.attr("method") == "get")
                form.submit();
            else {
                var actionUrl = this.url.effectiveUrlProvider(form.attr("action"), $(event.currentTarget));
                this.serverInvoker.invokeWithAjax(event, actionUrl);
            }
        };
        Paging.prototype.withAjax = function (event) {
            var button = $(event.currentTarget);
            var page = button.attr("data-pagination");
            var key = "p";
            if (page.split('=').length > 1) {
                key = page.split('=')[0];
                page = page.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            input.val(page);
            if (input.val() != page) {
                // Drop down list case
                input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
                input.remove();
            }
        };
        return Paging;
    }());
    exports.default = Paging;
});
define("olive/components/masterDetail", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MasterDetail = /** @class */ (function () {
        function MasterDetail(validate, responseProcessor) {
            this.validate = validate;
            this.responseProcessor = responseProcessor;
        }
        MasterDetail.prototype.initialize = function () {
            var _this = this;
            this.responseProcessor.subformChanged.handle(function (_) { return _this.updateSubFormStates(); });
        };
        MasterDetail.prototype.enable = function (selector) {
            var _this = this;
            selector.off("click.delete-subform").on("click.delete-subform", function (e) { return _this.deleteSubForm(e); });
        };
        MasterDetail.prototype.updateSubFormStates = function () {
            var countItems = function (element) { return $(element).parent().find(".subform-item:visible").length; };
            // Hide removed items
            $("input[name$=MustBeDeleted][value=False]").val("false");
            $("input[name$=MustBeDeleted][value=True]").val("true");
            $("input[name$=MustBeDeleted][value=true]").closest(".subform-item").hide();
            // hide empty headers
            $(".horizontal-subform thead").each(function (i, e) {
                return $(e).css("visibility", (countItems(e) > 0) ? "visible" : "hidden");
            });
            // Hide add buttons
            $("[data-subform-max]").each(function (i, e) {
                var show = countItems(e) < parseInt($(e).attr("data-subform-max"), 10);
                $(e).closest("[data-module]").find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
            });
            // Hide delete buttons
            $("[data-subform-min]").each(function (i, e) {
                var show = countItems(e) > parseInt($(e).attr("data-subform-min"), 10);
                $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css("visibility", (show) ? "visible" : "hidden");
            });
        };
        MasterDetail.prototype.deleteSubForm = function (event) {
            var button = $(event.currentTarget);
            var container = button.parents(".subform-item");
            this.validate.removeTooltipsRelatedTo(container);
            container.find("input[name$=MustBeDeleted]").val("true");
            container.find("[data-val=true]").attr("readonly", "readonly");
            this.updateSubFormStates();
            event.preventDefault();
        };
        return MasterDetail;
    }());
    exports.default = MasterDetail;
});
define("olive/components/grid", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Grid = /** @class */ (function () {
        function Grid() {
        }
        Grid.prototype.enableColumn = function (element) {
            var _this = this;
            element.off("click.apply-columns").on("click.apply-columns", function (e) { return _this.applyColumns(e); });
        };
        Grid.prototype.enableToggle = function (element) {
            var _this = this;
            element.off("change.select-all").on("change.select-all", function (e) { return _this.enableSelectAllToggle(e); });
        };
        Grid.prototype.enableHlightRow = function (element) {
            this.highlightRow(element);
        };
        Grid.prototype.enableSelectCol = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return _this.enableSelectColumns($(e)); });
        };
        Grid.prototype.applyColumns = function (event) {
            var button = $(event.currentTarget);
            var checkboxes = button.closest(".select-cols").find(":checkbox");
            if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0)
                return;
            $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
                .appendTo(button.parent());
        };
        Grid.prototype.enableSelectColumns = function (container) {
            var columns = container.find("div.select-cols");
            container.find("a.select-cols").click(function () { columns.show(); return false; });
            columns.find('.cancel').click(function () { return columns.hide(); });
        };
        Grid.prototype.enableSelectAllToggle = function (event) {
            var trigger = $(event.currentTarget);
            trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
        };
        Grid.prototype.highlightRow = function (element) {
            var target = $(element.closest("tr"));
            target.siblings('tr').removeClass('highlighted');
            target.addClass('highlighted');
        };
        Grid.prototype.mergeActionButtons = function () {
            $("table tr > .actions-merge, .r-grid .r-grid-row > .actions-merge").each(function (index, item) {
                var current = $(item);
                if (current.next().length === 0 && current.children("a,button").length <= 1)
                    return;
                var mergedContent;
                if (current.children("a").length > 0) {
                    mergedContent = {};
                    current.children("a").each(function (i, innerLink) {
                        var selected = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                    });
                }
                if (current.children("button").length > 0) {
                    if (!mergedContent)
                        mergedContent = {};
                    current.children("button").each(function (i, innerLink) {
                        var selected = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("formaction").trim() + "#ATTRIBUTE##BUTTON#";
                        if (selected.attr("data-confirm-question"))
                            mergedContent[selected.text().trim()] += "data-confirm-question='" + selected.attr("data-confirm-question") + "'";
                        if (selected.attr("formmethod"))
                            mergedContent[selected.text().trim()] += "formmethod='" + selected.attr("formmethod") + "'";
                    });
                }
                else if (!mergedContent) {
                    mergedContent = "";
                }
                current.nextAll(".actions-merge").each(function (i, innerItem) {
                    if (typeof mergedContent === "string")
                        mergedContent += " " + $(innerItem).html();
                    else {
                        var currentInnerItem = $(innerItem);
                        currentInnerItem.children("a").each(function (i, innerLink) {
                            var selected = $(innerLink);
                            mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                        });
                        currentInnerItem.children("button").each(function (i, innerLink) {
                            var selected = $(innerLink);
                            mergedContent[selected.text().trim()] = selected.attr("formaction").trim() + "#ATTRIBUTE##BUTTON#";
                            if (selected.attr("data-confirm-question"))
                                mergedContent[selected.text().trim()] += "data-confirm-question='" + selected.attr("data-confirm-question") + "'";
                            if (selected.attr("formmethod"))
                                mergedContent[selected.text().trim()] += "formmethod='" + selected.attr("formmethod") + "'";
                        });
                    }
                });
                if (typeof mergedContent === "string")
                    current.html(current.html() + mergedContent);
                else {
                    var dropDownList = "<div class=\"dropdown\">\n                <button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"dropdownMenuButton\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                  Select action\n                </button>\n                <div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\">";
                    for (var val in mergedContent) {
                        var urlAddress = mergedContent[val].split("#ATTRIBUTE#");
                        if (urlAddress[1].startsWith("#BUTTON#")) {
                            urlAddress[1] = urlAddress[1].replace("#BUTTON#", "");
                            dropDownList += "<a class=\"dropdown-item\" href=\"#\" formaction=\"" + urlAddress[0] + "\" " + urlAddress[1] + ">" + val + "</a>";
                        }
                        else
                            dropDownList += "<a class=\"dropdown-item\" href=\"" + urlAddress[0] + "\" " + urlAddress[1] + ">" + val + "</a>";
                    }
                    dropDownList += "</div></div>";
                    current.empty().append($(dropDownList));
                }
                current.nextAll(".actions-merge").remove();
            });
        };
        return Grid;
    }());
    exports.default = Grid;
});
define("olive/plugins/passwordStength", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var PasswordStength = /** @class */ (function () {
        function PasswordStength(container) {
            this.container = container;
        }
        PasswordStength.enable = function (selector) { selector.each(function (i, e) { return new PasswordStength($(e)).enable(); }); };
        PasswordStength.prototype.enable = function () {
            // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md
            if (this.container.find(".progress").length !== 0)
                return;
            var formGroup = this.container.closest(".form-group");
            var options = {
                common: {},
                rules: {},
                ui: {
                    container: formGroup,
                    showVerdictsInsideProgressBar: true,
                    showStatus: true,
                    showPopover: false,
                    showErrors: false,
                    viewports: {
                        progress: this.container
                    },
                    verdicts: [
                        "<span class='fa fa-exclamation-triangle'></span> Weak",
                        "<span class='fa fa-exclamation-triangle'></span> Normal",
                        "Medium",
                        "<span class='fa fa-thumbs-up'></span> Strong",
                        "<span class='fa fa-thumbs-up'></span> Very Strong"
                    ],
                }
            };
            var password = formGroup.find(":password");
            if (password.length == 0) {
                console.log('Error: no password field found for password strength.');
                console.log(this.container);
            }
            else
                password.pwstrength(options);
        };
        return PasswordStength;
    }());
    exports.default = PasswordStength;
});
define("olive/plugins/htmlEditor", ["require", "exports", "olive/config"], function (require, exports, config_3) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HtmlEditorFactory = void 0;
    var HtmlEditorFactory = /** @class */ (function () {
        function HtmlEditorFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        HtmlEditorFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new HtmlEditor($(e), _this.modalHelper).enable(); });
        };
        return HtmlEditorFactory;
    }());
    exports.HtmlEditorFactory = HtmlEditorFactory;
    var HtmlEditor = /** @class */ (function () {
        function HtmlEditor(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        HtmlEditor.prototype.enable = function () {
            var _this = this;
            if (this.input.css("display") === "none")
                return;
            window["CKEDITOR_BASEPATH"] = config_3.default.CK_EDITOR_BASE_PATH;
            this.onDemandScript(config_3.default.CK_EDITOR_BASE_PATH + "ckeditor.js", function () { return _this.onCkEditorScriptReady(); });
        };
        HtmlEditor.prototype.onCkEditorScriptReady = function () {
            var _this = this;
            CKEDITOR.basePath = config_3.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_3.default.CK_EDITOR_BASE_PATH + 'contents.css';
            var editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());
            editor.on('change', function (evt) { return evt.editor.updateElement(); });
            editor.on("instanceReady", function (event) { return _this.modalHelper.adjustHeight(); });
        };
        HtmlEditor.prototype.getEditorSettings = function () {
            return {
                toolbar: this.input.attr('data-toolbar') || config_3.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
            };
        };
        HtmlEditor.prototype.onDemandScript = function (url, callback) {
            callback = (typeof callback !== "undefined") ? callback : {};
            $.ajax({
                type: "GET",
                url: url,
                success: callback,
                dataType: "script",
                cache: true
            });
        };
        HtmlEditor.editorConfigPath = "/scripts/ckeditor_config.js";
        return HtmlEditor;
    }());
    exports.default = HtmlEditor;
});
define("olive/plugins/timeControl", ["require", "exports", "olive/config"], function (require, exports, config_4) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimeControlFactory = void 0;
    var TimeControlFactory = /** @class */ (function () {
        function TimeControlFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        TimeControlFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new TimeControl($(e), _this.modalHelper); });
        };
        return TimeControlFactory;
    }());
    exports.TimeControlFactory = TimeControlFactory;
    var TimeControl = /** @class */ (function () {
        function TimeControl(targetInput, modalHelper) {
            var _this = this;
            this.modalHelper = modalHelper;
            var input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
            }
            input.attr("data-autofocus", "disabled");
            var options = {
                format: config_4.default.TIME_FORMAT,
                useCurrent: false,
                stepping: parseInt(input.attr("data-minute-steps") || config_4.default.MINUTE_INTERVALS.toString()),
                keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                locale: config_4.default.DATE_LOCALE,
                icons: {
                    up: "fas fa-chevron-up",
                    down: "fas fa-chevron-down"
                }
            };
            input.datetimepicker(options).data("DateTimePicker").keyBinds().clear = null;
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(function () { input.focus(); });
        }
        return TimeControl;
    }());
    exports.default = TimeControl;
});
define("olive/plugins/autoComplete", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoCompleteFactory = void 0;
    var AutoCompleteFactory = /** @class */ (function () {
        function AutoCompleteFactory(url, form, serverInvoker) {
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        AutoCompleteFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new AutoComplete($(e), _this.url, _this.form, _this.serverInvoker).enable(); });
        };
        return AutoCompleteFactory;
    }());
    exports.AutoCompleteFactory = AutoCompleteFactory;
    var AutoComplete = /** @class */ (function () {
        function AutoComplete(input, url, form, serverInvoker) {
            this.input = input;
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        AutoComplete.setOptions = function (options) {
            AutoComplete.customOptions = options;
        };
        AutoComplete.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-typeahead-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-typeahead-enabled", "true");
            }
            if (this.input.is("[data-change-action]")) {
                this.serverInvoker.enableInvokeWithAjax(this.input, "typeahead:select", "data-change-action");
                this.input.on("change.deselect", function (event) {
                    setTimeout(function () {
                        if (!_this.valueField.val() && _this.selectedItemOnEnter) {
                            _this.input.trigger("typeahead:select", { event: event, item: undefined });
                        }
                    }, 100);
                });
                this.input.on("focus.deselect", function () { return _this.selectedItemOnEnter = _this.valueField.val(); });
            }
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            this.input
                .wrap("<span class='typehead-chevron-down'></span>")
                .before('<i class="fas fa-chevron-down"></i>')
                .data("selected-text", "")
                .on("input", function () { return _this.clearValue(); })
                .typeahead($.extend(true, this.getDefaultOptions(), AutoComplete.customOptions, this.getMandatoryOptions()));
        };
        AutoComplete.prototype.getMandatoryOptions = function () {
            var _this = this;
            var url = this.input.attr("autocomplete-source") || "";
            url = this.url.effectiveUrlProvider(url, this.input);
            return {
                source: {
                    values: {
                        display: "Display",
                        data: [{
                                Display: "",
                                Text: "",
                                Value: "",
                            }],
                        ajax: function (_) {
                            return {
                                type: "POST",
                                url: url,
                                data: _this.getPostData(),
                                xhrFields: { withCredentials: true },
                            };
                        },
                    },
                },
                callback: this.getMandatoryCallbacks(),
            };
        };
        AutoComplete.prototype.getMandatoryCallbacks = function () {
            var _this = this;
            var callback = {
                onClickAfter: function (node, a, item, event) {
                    _this.itemSelected(item);
                    _this.input.trigger("typeahead:select", { event: event, item: item });
                },
                onPopulateSource: function (node, data) {
                    var text = _this.input.val();
                    var index = data.findIndex(function (x) { return (x.Text || '').trim().toLowerCase() === text.toLowerCase().trim(); });
                    if (index >= 0) {
                        _this.valueField.val(data[index].Value);
                    }
                    return data;
                },
            };
            if (this.input.data("strict") === true) {
                callback = $.extend(callback, {
                    onHideLayout: function () {
                        if (_this.valueField.val() === "") {
                            _this.input.val("");
                        }
                    },
                });
            }
            return callback;
        };
        AutoComplete.prototype.getDefaultOptions = function () {
            var clientSideSearch = this.input.attr("clientside") || false;
            return {
                maxItem: 0,
                minLength: 0,
                dynamic: !clientSideSearch,
                searchOnFocus: true,
                debug: false,
                delay: 500,
                backdrop: false,
                correlativeTemplate: true,
                templateValue: "{{Text}}",
                emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
            };
        };
        AutoComplete.prototype.getPostData = function () {
            var postData = this.toObject(this.form.getPostData(this.input));
            postData[this.input.attr("name")] = "{{query}}";
            return postData;
        };
        AutoComplete.prototype.clearValue = function () {
            if (this.input.val() === "") {
                this.valueField.val("");
            }
            if (this.input.val() !== this.input.data("selected-text")) {
                this.valueField.val("");
            }
        };
        AutoComplete.prototype.itemSelected = function (item) {
            if (item) {
                var txt = (item.Text === null || item.Text === undefined || item.Text.trim() === "") ?
                    item.Display : item.Text;
                if (txt) {
                    txt = $("<div/>").html(txt).text();
                }
                this.valueField.val(item.Value);
                this.input.data("selected-text", txt);
                this.input.val(txt);
            }
            else {
                this.input.data("selected-text", "");
            }
            // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event
            // when it sets its value from drop down
            this.input.trigger("change");
        };
        // Convert current form array to simple plain object
        AutoComplete.prototype.toObject = function (arr) {
            var rv = {};
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var item = arr_1[_i];
                rv[item.name] = item.value;
            }
            return rv;
        };
        return AutoComplete;
    }());
    exports.default = AutoComplete;
});
define("olive/plugins/globalSearch", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionEnum = exports.AjaxState = exports.GlobalSearchFactory = void 0;
    var GlobalSearchFactory = /** @class */ (function () {
        function GlobalSearchFactory(waiting, modalHelper) {
            this.waiting = waiting;
            this.modalHelper = modalHelper;
        }
        GlobalSearchFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new GlobalSearch($(e), _this.waiting, _this.modalHelper).enable(); });
        };
        return GlobalSearchFactory;
    }());
    exports.GlobalSearchFactory = GlobalSearchFactory;
    var GlobalSearch = /** @class */ (function () {
        function GlobalSearch(input, waiting, modalHelper) {
            this.input = input;
            this.waiting = waiting;
            this.isMouseInsideSearchPanel = false;
            this.isTyping = false;
            this.searchedText = null;
            this.modalHelper = modalHelper;
        }
        GlobalSearch.prototype.boldSearch = function (str, searchText) {
            var ix = -1;
            var result = "";
            if (str !== null && str !== undefined) {
                str = str.replace(/<strong>/gi, "↨↨").replace(/<\/strong>/gi, "↑↑");
                var strlower = str.toLowerCase();
                if (searchText !== "" && searchText !== null && searchText !== undefined) {
                    var stxt = searchText.toLowerCase();
                    do {
                        var ixNext = strlower.indexOf(stxt, ix);
                        if (ixNext < 0) {
                            break;
                        }
                        if (ix < 0) {
                            result = str.substr(0, ixNext);
                        }
                        result += (ix >= 0 ? str.substr(ix, ixNext - ix) : "") +
                            "<strong>" +
                            str.substr(ixNext, stxt.length) + "</strong>";
                        ix = ixNext + stxt.length;
                    } while (true);
                }
                result += (ix < 0 ? str : str.substr(ix, str.length - ix));
                result = result.replace(/↨↨/gi, "<strong>").replace(/↑↑/gi, "</strong>");
            }
            return result;
        };
        GlobalSearch.prototype.boldSearchAll = function (str, searchText) {
            var result = str;
            if (searchText !== null && searchText !== undefined) {
                var splitedsearchtext = searchText.split(" ");
                for (var _i = 0, splitedsearchtext_1 = splitedsearchtext; _i < splitedsearchtext_1.length; _i++) {
                    var strST = splitedsearchtext_1[_i];
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        };
        GlobalSearch.prototype.enable = function () {
            var _this = this;
            if (this.input.is("[data-globalsearch-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-globalsearch-enabled", "true");
            }
            this.input.wrap("<div class='global-search-panel'></div>");
            var urlsList = (this.input.attr("data-search-source") || "").split(";");
            this.urlList = urlsList;
            var timeout = null;
            this.input.keyup(function (e) {
                if (e.keyCode === 27) {
                    return;
                }
                _this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((function () {
                    _this.isTyping = false;
                    if (_this.searchedText !== _this.input.val().trim()) {
                        _this.createSearchComponent(_this.urlList);
                    }
                }), 300);
            });
            this.input.on("blur", (function (e) {
                if (_this.isMouseInsideSearchPanel === false) {
                    _this.clearSearchComponent();
                }
            }));
            this.input.on("focus", (function (e) {
                var inputholder = _this.input.parent();
                var panel = inputholder.find(".global-search-result-panel");
                if (panel.children().length > 0)
                    panel.show();
            }));
        };
        GlobalSearch.prototype.clearSearchComponent = function () {
            var inputholder = this.input.parent();
            if (inputholder !== undefined) {
                var panel = inputholder.find(".global-search-result-panel");
                if (panel !== undefined) {
                    panel.fadeOut('fast');
                    // panel.empty();
                    // panel.remove();
                }
            }
        };
        GlobalSearch.prototype.getResultPanel = function () {
            var _this = this;
            var searchPanel = this.input.parent();
            var resultPanel = searchPanel.find(".global-search-result-panel");
            if (resultPanel === undefined || resultPanel === null || resultPanel.length === 0) {
                resultPanel = $("<div class='global-search-result-panel'>")
                    .mouseenter(function () { return _this.isMouseInsideSearchPanel = true; })
                    .mouseleave(function () { return _this.isMouseInsideSearchPanel = false; });
                searchPanel.append(resultPanel);
            }
            else {
                resultPanel.empty().show();
            }
            $(window).on("keydown", function (e) {
                if (e.keyCode === 27) {
                    resultPanel.hide(null, function () {
                        $(window).off("keydown");
                    });
                    $('input[name=searcher]').val('');
                }
            });
            return resultPanel;
        };
        GlobalSearch.prototype.createSearchComponent = function (urls) {
            var _this = this;
            this.searchedText = this.input.val().trim();
            var resultPanel = this.getResultPanel();
            resultPanel.empty();
            var searchHolder = $("<div class='search-container'>");
            this.waiting.show();
            var ajaxList = urls.map(function (p) {
                var icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon: icon,
                    state: AjaxState.pending,
                };
            });
            var context = {
                ajaxList: ajaxList,
                resultCount: 0,
                resultPanel: resultPanel,
                searchHolder: searchHolder,
                beginSearchStarted: true,
                searchedText: this.searchedText,
            };
            var _loop_1 = function (ajaxObject) {
                ajaxObject.ajx = $
                    .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: function (result) { return _this.onSuccess(ajaxObject, context, result); },
                    complete: function (jqXhr) { return _this.onComplete(context, jqXhr); },
                    error: function (jqXhr) { return _this.onError(ajaxObject, resultPanel, jqXhr); },
                });
            };
            for (var _i = 0, _a = context.ajaxList; _i < _a.length; _i++) {
                var ajaxObject = _a[_i];
                _loop_1(ajaxObject);
            }
        };
        GlobalSearch.prototype.onSuccess = function (sender, context, result) {
            var _this = this;
            if (this.isTyping === false) {
                sender.result = result;
                if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                    sender.state = AjaxState.success;
                    var resultfiltered = result.filter(function (p) { return _this.isValidResult(p, context); });
                    var searchItem = this.createSearchItems(sender, context, resultfiltered);
                    context.searchHolder.append(searchItem);
                    if (context.beginSearchStarted && resultfiltered.length > 0) {
                        context.beginSearchStarted = false;
                        context.resultPanel.append(context.searchHolder);
                    }
                }
                else {
                    sender.state = AjaxState.failed;
                    console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                }
            }
        };
        GlobalSearch.prototype.isValidResult = function (item, context) {
            var resfilter = false;
            if (context.searchedText) {
                var arfilter = context.searchedText.split(" ");
                for (var _i = 0, arfilter_1 = arfilter; _i < arfilter_1.length; _i++) {
                    var strfilter = arfilter_1[_i];
                    if (((item.Description !== null &&
                        item.Description !== undefined &&
                        item.Description.match(new RegExp(strfilter, "gi")) !== null) ||
                        item.Title.match(new RegExp(strfilter, "gi")) !== null)) {
                        resfilter = true;
                        break;
                    }
                }
            }
            else {
                resfilter = true;
            }
            return resfilter;
        };
        GlobalSearch.prototype.createSearchItems = function (sender, context, items) {
            var _a;
            var searchItem = $("<div class='search-item'>");
            var groupTitle = ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ? items[0].GroupTitle : sender.url.split(".")[0].replace("https://", "").replace("http://", "").toUpperCase();
            var searchTitleHolder = $("<div class='search-title'>");
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                searchItem.css("color", items[0].Colour);
                searchTitleHolder.css("color", items[0].Colour);
            }
            var searhTitle = searchTitleHolder.append($("<i>").attr("class", sender.icon)).append(groupTitle);
            searchItem.append(searhTitle);
            var childrenItems = $("<ul>");
            for (var i = 0; i < items.length && i < 10; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            $(childrenItems).find("[target='$modal'][href]").off("click").click(function () {
                $(".global-search-result-panel").fadeOut();
            });
            this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));
            searchItem.append(childrenItems);
            if (items.length === 0) {
                searchItem.addClass("d-none");
            }
            return searchItem;
        };
        GlobalSearch.prototype.createItem = function (item, context) {
            var attr = "";
            if (item.Action == ActionEnum.Popup)
                attr = "target=\"$modal\"";
            else if (item.Action == ActionEnum.NewWindow)
                attr = "target=\"_blank\"";
            return $("<li>")
                .append((item.IconUrl === null || item.IconUrl === undefined) ?
                $("<div class='icon'>") : this.showIcon(item))
                .append($("<a href='" + item.Url + "' " + attr + ">")
                .html(this.boldSearchAll(item.Title, context.searchedText)))
                .append($(" <div class='desc'>").html(item.Description));
        };
        GlobalSearch.prototype.onComplete = function (context, jqXHR) {
            if (context.ajaxList.filter(function (p) { return p.state === 0; }).length === 0) {
                this.waiting.hide();
                if (context.resultCount === 0) {
                    var ulNothing = $("<ul>");
                    ulNothing.append("<li>").append("<span>").html("Nothing found");
                    context.resultPanel.append(ulNothing);
                }
            }
        };
        GlobalSearch.prototype.onError = function (sender, resultPanel, jqXHR) {
            sender.state = AjaxState.failed;
            var ulFail = $("<ul>");
            ulFail.append($("<li>").append($("<span>")
                .html("ajax failed Loading data from source [" + sender.url + "]")));
            resultPanel.append(ulFail);
            console.error(jqXHR);
        };
        GlobalSearch.prototype.showIcon = function (item) {
            if (item.IconUrl.indexOf("fa-") > 0) {
                return $("<div class='icon'>").append($("<i class='" + item.IconUrl + "'></i>"));
            }
            else {
                return $("<div class='icon'>").append($("<img src='" + item.IconUrl + "'>"));
            }
        };
        return GlobalSearch;
    }());
    exports.default = GlobalSearch;
    var AjaxState;
    (function (AjaxState) {
        AjaxState[AjaxState["pending"] = 0] = "pending";
        AjaxState[AjaxState["success"] = 1] = "success";
        AjaxState[AjaxState["failed"] = 2] = "failed";
    })(AjaxState = exports.AjaxState || (exports.AjaxState = {}));
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum[ActionEnum["Redirect"] = 0] = "Redirect";
        ActionEnum[ActionEnum["Popup"] = 1] = "Popup";
        ActionEnum[ActionEnum["NewWindow"] = 2] = "NewWindow";
    })(ActionEnum = exports.ActionEnum || (exports.ActionEnum = {}));
});
define("olive/plugins/slider", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SliderFactory = void 0;
    var SliderFactory = /** @class */ (function () {
        function SliderFactory(form) {
            this.form = form;
        }
        SliderFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new Slider($(e), _this.form).enable(); });
        };
        return SliderFactory;
    }());
    exports.SliderFactory = SliderFactory;
    var Slider = /** @class */ (function () {
        function Slider(targetInput, form) {
            this.form = form;
            this.input = targetInput;
            this.options = { min: 0, max: 100, value: null, range: false, formatter: null, tooltip: 'always', upper: null, tooltip_split: false };
        }
        Slider.prototype.enable = function () {
            var _this = this;
            var data_options = this.input.attr("data-options") ? JSON.parse(this.form.cleanJson(this.input.attr("data-options"))) : null;
            if (data_options)
                $.extend(true, this.options, data_options);
            this.options.range = this.input.attr("data-control") == "range-slider";
            if (this.options.range) {
                if (this.options.tooltip_split == false)
                    this.options.formatter = function (v) { return v[0] + " - " + v[1]; };
                if (this.input.attr("id").endsWith("Max"))
                    return;
                var maxInput_1 = $('[name="' + this.input.attr("id").split('.')[0] + "." + this.options.upper + '\"]');
                if (maxInput_1.length == 0)
                    maxInput_1 = $('[name="' + (this.options.upper || (this.input.attr("id") + 'Max')) + '\"]');
                if (maxInput_1.length == 0)
                    throw new Error("Upper input was not found for the range slider.");
                this.options.value = [Number(this.input.val() || this.options.min), Number(maxInput_1.val() || this.options.max)];
                // Standard SEARCH min and max.														 
                // TODO: Change the following to first detect if we're in a search control context and skip the following otherwise.
                var container = $(this.input).closest(".group-control");
                if (container.length == 0)
                    container = this.input.parent();
                container.children().each(function (i, e) { return $(e).hide(); });
                var rangeSlider = $("<input type='text' class='range-slider'/>").attr("id", this.input.attr("id") + "_slider").appendTo(container);
                rangeSlider.slider(this.options).on('change', function (ev) { _this.input.val(ev.value.newValue[0]); maxInput_1.val(ev.value.newValue[1]); }); ///// Updated ***********
            }
            else {
                this.options.value = Number(this.input.val() || this.options.min);
                this.input.slider(this.options).on('change', function (ev) { _this.input.val(ev.value.newValue); }); ///// Updated ***********
            }
        };
        return Slider;
    }());
    exports.default = Slider;
});
define("olive/plugins/dateTimePickerBase", ["require", "exports", "olive/config"], function (require, exports, config_5) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var dateTimePickerBase = /** @class */ (function () {
        function dateTimePickerBase(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        dateTimePickerBase.prototype.show = function () {
            var _this = this;
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return _this.modalHelper.expandToFitPicker(e); });
            }
            this.input.attr("data-autofocus", "disabled");
            var control = this.input.data("control");
            var stepping = Number(this.input.data("minute-steps") || "1");
            if (control == this.controlType) {
                var options = {
                    format: this.format,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: {
                        today: "fas fa-calendar-check",
                        clear: "fas fa-eraser",
                        time: "fas fa-clock",
                        date: "fas fa-calendar-alt",
                        up: "fas fa-chevron-up",
                        down: "fas fa-chevron-down",
                        next: "fas fa-chevron-right",
                        previous: "fas fa-chevron-left"
                    },
                    keepInvalid: this.input.closest("form").find("[data-change-action]").length == 0,
                    locale: config_5.default.DATE_LOCALE,
                    stepping: stepping
                };
                this.modifyOptions(options);
                this.input.datetimepicker(options);
                // Now make calendar icon clickable as well             
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(function () { return _this.input.focus(); });
            }
            else
                alert("Don't know how to handle date control of " + control);
        };
        return dateTimePickerBase;
    }());
    exports.default = dateTimePickerBase;
});
define("olive/plugins/datePicker", ["require", "exports", "olive/config", "olive/plugins/dateTimePickerBase"], function (require, exports, config_6, dateTimePickerBase_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatePickerFactory = void 0;
    var DatePickerFactory = /** @class */ (function () {
        function DatePickerFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        DatePickerFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new DatePicker($(e), _this.modalHelper).show(); });
        };
        return DatePickerFactory;
    }());
    exports.DatePickerFactory = DatePickerFactory;
    var DatePicker = /** @class */ (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(targetInput, modalHelper) {
            var _this = _super.call(this, targetInput, modalHelper) || this;
            _this.controlType = "date-picker";
            _this.format = config_6.default.DATE_FORMAT;
            return _this;
        }
        DatePicker.prototype.modifyOptions = function (options) {
            $.extend(options, {
                viewMode: this.input.attr("data-view-mode") || 'days',
                minDate: this.input.attr("min-date"),
                maxDate: this.input.attr("max-date")
            });
        };
        return DatePicker;
    }(dateTimePickerBase_1.default));
    exports.default = DatePicker;
});
define("olive/plugins/dateTimePicker", ["require", "exports", "olive/plugins/dateTimePickerBase", "olive/config"], function (require, exports, dateTimePickerBase_2, config_7) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DateTimePickerFactory = void 0;
    var DateTimePickerFactory = /** @class */ (function () {
        function DateTimePickerFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        DateTimePickerFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new DateTimePicker($(e), _this.modalHelper).show(); });
        };
        return DateTimePickerFactory;
    }());
    exports.DateTimePickerFactory = DateTimePickerFactory;
    var DateTimePicker = /** @class */ (function (_super) {
        __extends(DateTimePicker, _super);
        function DateTimePicker(targetInput, modalHelper) {
            var _this = _super.call(this, targetInput, modalHelper) || this;
            _this.controlType = "date-picker|time-picker";
            _this.format = config_7.default.DATE_TIME_FORMAT;
            return _this;
        }
        DateTimePicker.prototype.modifyOptions = function (options) {
            $.extend(options, {
                sideBySide: true,
                showClear: true,
                minDate: this.input.attr("min-date"),
                maxDate: this.input.attr("max-date")
            });
        };
        return DateTimePicker;
    }(dateTimePickerBase_2.default));
    exports.default = DateTimePicker;
});
define("olive/plugins/numericUpDown", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var NumbericUpDown = /** @class */ (function () {
        function NumbericUpDown(input) {
            this.input = input;
        }
        NumbericUpDown.enable = function (selector) { selector.each(function (i, e) { return new NumbericUpDown($(e)).enable(); }); };
        NumbericUpDown.prototype.enable = function () {
            var min = this.input.attr("data-val-range-min");
            var max = this.input.attr("data-val-range-max");
            this.input.spinedit({
                minimum: parseFloat(min),
                maximum: parseFloat(max),
                step: 1,
            });
        };
        return NumbericUpDown;
    }());
    exports.default = NumbericUpDown;
});
define("olive/plugins/fileUpload", ["require", "exports", "olive/components/crossDomainEvent", "file-style"], function (require, exports, crossDomainEvent_3) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileUploadS3 = exports.FileUploadFactory = void 0;
    // For configuration see:
    // http://markusslima.github.io/bootstrap-filestyle/
    // https://blueimp.github.io/jQuery-File-Upload/
    var FileUploadFactory = /** @class */ (function () {
        function FileUploadFactory(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        FileUploadFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (_, e) {
                var input = $(e);
                var s3Url = input.data("s3-url");
                if (!s3Url) {
                    new FileUpload(input, _this.url, _this.serverInvoker).enable();
                }
                else {
                    new FileUploadS3(input, _this.url, _this.serverInvoker, s3Url).enable();
                }
            });
        };
        return FileUploadFactory;
    }());
    exports.FileUploadFactory = FileUploadFactory;
    var FileUpload = /** @class */ (function () {
        function FileUpload(input, url, serverInvoker) {
            var _this = this;
            this.input = input;
            this.url = url;
            this.serverInvoker = serverInvoker;
            this.onUploadError = function (jqXHR, status, error) {
                _this.serverInvoker.onAjaxResponseError(jqXHR, status, error);
                _this.filenameInput.val("");
            };
            this.fixMasterDetailsInputName();
            // console.log("Check me!!")
            // this.input.before(this.input.siblings('input'));
            this.container = this.input.closest(".file-upload");
            // this.idInput = this.container.find("input.file-id");
            // this.fileLabel = this.input.parent().find(':text');
            this.actionInput = this.container.find(".Action");
            this.tempFileIdInput = this.container.find(".TempFileId");
            this.filenameInput = this.container.find(".Filename");
            this.validationInput = this.container.find(".validation");
            this.deleteButton = this.container.find(".delete-file").click(function (e) { return _this.onDeleteButtonClicked(); });
        }
        FileUpload.prototype.enable = function () {
            this.input.attr("data-url", this.getDataUrlAttribute());
            this.input.filestyle(this.getFilestyleOptions());
            this.container.find(".bootstrap-filestyle > input:text").wrap($("<div class='progress'></div>"));
            this.progressBar = this.container.find(".progress-bar");
            this.container.find(".bootstrap-filestyle > .progress").prepend(this.progressBar);
            if (this.actionInput.val() !== "Removed") {
                this.currentFileLink = this.container.find(".current-file > a");
                this.existingFileNameInput = this.container.find(".bootstrap-filestyle > .progress > input:text");
            }
            if (this.hasExistingFile() && this.existingFileNameInput.val() === "") {
                this.showExistingFile();
            }
            this.input.fileupload(this.getFileuploadOptions());
        };
        FileUpload.prototype.getDataUrlAttribute = function () {
            return this.url.effectiveUrlProvider("/upload", this.input);
        };
        FileUpload.prototype.getFilestyleOptions = function () {
            return {
                input: this.input.attr("data-input") !== "false",
                htmlIcon: this.input.attr("data-icon"),
                buttonBefore: this.input.attr("data-buttonBefore") ?
                    this.input.attr("data-buttonBefore") !== "false" : true,
                disabled: this.input.attr("data-disabled") === "true",
                size: this.input.attr("data-size"),
                text: this.input.attr("data-text"),
                btnClass: this.input.attr("data-btnClass"),
                badge: this.input.attr("data-badge") === "true",
                dragdrop: this.input.attr("data-dragdrop") !== "false",
                badgeName: this.input.attr("data-badgeName"),
                placeholder: this.input.attr("data-placeholder"),
            };
        };
        FileUpload.prototype.getFileuploadOptions = function () {
            return {
                dataType: "json",
                dropZone: this.container.find("*"),
                replaceFileInput: false,
                drop: this.onDragDropped.bind(this),
                change: this.onChange.bind(this),
                progressall: this.onProgressAll.bind(this),
                error: this.onUploadError,
                success: this.onUploadSuccess.bind(this),
                xhrFields: { withCredentials: true },
                complete: this.onUploadCompleted.bind(this),
            };
        };
        FileUpload.prototype.fixMasterDetailsInputName = function () {
            var nameParts = this.input.attr("name").split(".");
            this.input.attr("name", nameParts[nameParts.length - 1]);
        };
        FileUpload.prototype.hasExistingFile = function () {
            if (!this.currentFileLink) {
                return false;
            }
            var name = this.currentFileLink.text();
            if (!name) {
                return false;
            }
            if (name === "«UNCHANGED»") {
                return false;
            }
            if (name === "NoFile.Empty") {
                return false;
            }
            return true;
        };
        FileUpload.prototype.showExistingFile = function () {
            var _this = this;
            this.deleteButton.show();
            this.progressBar.width("100%");
            this.existingFileNameInput
                .val(this.currentFileLink.text())
                .removeAttr("disabled")
                .addClass("file-target")
                .attr("readonly", "readonly")
                .click(function () { return _this.currentFileLink[0].click(); });
            this.setValidationValue("value");
        };
        FileUpload.prototype.removeExistingFile = function () {
            if (!this.hasExistingFile()) {
                return;
            }
            this.existingFileNameInput.removeClass("file-target").attr("disabled", "true").off();
        };
        FileUpload.prototype.onDeleteButtonClicked = function () {
            this.deleteButton.hide();
            this.actionInput.val("Removed");
            this.setValidationValue("");
            this.progressBar.width(0);
            this.input.filestyle("clear");
            this.removeExistingFile();
            this.tempFileIdInput.val("");
        };
        FileUpload.prototype.onDragDropped = function (e, data) {
            if (this.filenameInput.length > 0 && data.files.length > 0) {
                this.filenameInput.val(data.files.map(function (x) { return x.name; }));
            }
        };
        FileUpload.prototype.onProgressAll = function (e, data) {
            var progress = parseInt((data.loaded / data.total * 100).toString(), 10);
            this.progressBar.width(progress + "%");
        };
        FileUpload.prototype.onUploadSuccess = function (response) {
            if (response.Error) {
                this.serverInvoker.onAjaxResponseError({ responseText: response.Error }, "error", response.Error);
                this.filenameInput.val("");
            }
            else {
                if (this.input.is("[multiple]")) {
                    this.tempFileIdInput.val(this.tempFileIdInput.val() + "|" + response.Result.ID);
                    this.filenameInput.val(this.filenameInput.val() + ", " + response.Result.Name);
                }
                else {
                    this.tempFileIdInput.val(response.Result.ID);
                    this.filenameInput.val(response.Result.Name);
                }
                this.deleteButton.show();
                this.setValidationValue("value");
            }
        };
        FileUpload.prototype.onUploadCompleted = function (response) {
            var id = response.responseJSON.Result.ID;
            var filename = response.responseJSON.Result.Name;
            this.UploadCompleted({
                url: this.url.makeAbsolute(undefined, "/temp-file/" + id),
                id: id,
                filename: filename,
            });
        };
        FileUpload.prototype.UploadCompleted = function (args) {
            crossDomainEvent_3.default.raise(parent, "file-uploaded", args);
        };
        FileUpload.prototype.onChange = function (e, data) {
            this.progressBar.width(0);
            this.removeExistingFile();
        };
        FileUpload.prototype.setValidationValue = function (value) {
            this.validationInput.val(value);
            this.input.closest("form").validate().element(this.validationInput);
        };
        return FileUpload;
    }());
    exports.default = FileUpload;
    var FileUploadS3 = /** @class */ (function (_super) {
        __extends(FileUploadS3, _super);
        function FileUploadS3(input, url, serverInvoker, bucketUrl) {
            var _this = _super.call(this, input, url, serverInvoker) || this;
            _this.bucketUrl = bucketUrl;
            _this.add = function (e, snedData) {
                var file = snedData.files[0]; // (e.target as HTMLInputElement).files[0];
                var id = _this.uuidv4();
                var key = id + "/" + file.name;
                var data = new FormData();
                data.append("key", key);
                data.append("acl", "public-read");
                data.append("file", file, file.name);
                $.ajax({
                    url: _this.bucketUrl,
                    type: "POST",
                    processData: false,
                    contentType: false,
                    data: data,
                    success: function () {
                        if (_this.input.is("[multiple]")) {
                            _this.tempFileIdInput.val(_this.tempFileIdInput.val() + "|" + id);
                            _this.filenameInput.val(_this.filenameInput.val() + ", " + file.name);
                        }
                        else {
                            _this.tempFileIdInput.val(id);
                            _this.filenameInput.val(file.name);
                        }
                        _this.onUploadCompleted({
                            id: id,
                            filename: file.name,
                        });
                        _this.deleteButton.show();
                        _this.setValidationValue("value");
                    },
                    error: function (jqXhr, _, message) {
                        _this.serverInvoker.onAjaxResponseError(jqXhr, "error", message);
                        _this.filenameInput.val("");
                    },
                    xhr: function () {
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", function (evt) {
                            if (evt.lengthComputable) {
                                _this.onProgressAll(undefined, evt);
                            }
                        }, false);
                        return xhr;
                    },
                });
            };
            _this.uuidv4 = function () {
                return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                    // tslint:disable-next-line: no-bitwise
                    var r = Math.random() * 16 | 0;
                    // tslint:disable-next-line: no-bitwise
                    var v = c === "x" ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            return _this;
        }
        FileUploadS3.prototype.getDataUrlAttribute = function () {
            return undefined;
        };
        FileUploadS3.prototype.getFileuploadOptions = function () {
            return $.extend({
                add: this.add,
            }, _super.prototype.getFileuploadOptions.call(this));
        };
        FileUploadS3.prototype.onUploadCompleted = function (_a) {
            var id = _a.id, filename = _a.filename;
            var url = "" + this.bucketUrl + id + "/" + filename;
            this.UploadCompleted({ id: id, filename: filename, url: url });
        };
        return FileUploadS3;
    }(FileUpload));
    exports.FileUploadS3 = FileUploadS3;
});
define("olive/plugins/confirmBox", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfirmBox = void 0;
    var ConfirmBoxFactory = /** @class */ (function () {
        function ConfirmBoxFactory() {
        }
        ConfirmBoxFactory.prototype.enable = function (selector) { selector.each(function (i, e) { return new ConfirmBox($(e)).enable(); }); };
        return ConfirmBoxFactory;
    }());
    exports.default = ConfirmBoxFactory;
    var ConfirmBox = /** @class */ (function () {
        function ConfirmBox(button) {
            this.button = button;
        }
        ConfirmBox.prototype.enable = function () {
            var _this = this;
            this.button.off("click.confirm-question").bindFirst("click.confirm-question", function (e) {
                e.stopImmediatePropagation();
                _this.setButtonsLabel(_this.button.attr('data-confirm-ok') || 'OK', _this.button.attr('data-confirm-cancel') || 'Cancel');
                _this.showConfirm(_this.button.attr('data-confirm-question'), function () {
                    _this.button.off("click.confirm-question");
                    _this.button.trigger('click');
                    _this.enable();
                });
                return false;
            });
        };
        ConfirmBox.prototype.setButtonsLabel = function (ok, cancel) {
            alertify.set({ labels: { ok: ok, cancel: cancel } });
        };
        ConfirmBox.prototype.showConfirm = function (text, yesCallback) {
            alertify.confirm(text.replace(/\r/g, "<br />"), function (e) {
                if (e)
                    yesCallback();
                else
                    return false;
            });
        };
        return ConfirmBox;
    }());
    exports.ConfirmBox = ConfirmBox;
});
define("olive/plugins/subMenu", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SubMenu = /** @class */ (function () {
        function SubMenu(targetMenue) {
            this.menu = targetMenue;
            this.submenuOptions = { showTimeout: 0, hideTimeout: 0 };
            if (!!this.menu.attr('data-smartmenus-id'))
                return; // Already enabled
            this.menu.addClass("sm");
            if (this.menu.is(".nav-stacked.dropped-submenu"))
                this.menu.addClass("sm-vertical");
            var options = this.menu.attr("data-submenu-options");
            if (options)
                this.submenuOptions = JSON.safeParse(options);
            this.menu.smartmenus(this.submenuOptions);
        }
        SubMenu.enable = function (selector) { selector.each(function (i, e) { return new SubMenu($(e)); }); };
        SubMenu.createAccordion = function (selector) {
            selector.find('[data-toggle]').click(function (event) {
                $($(event.target).parent('li').siblings().children('[data-toggle][aria-expanded=true]')).trigger('click');
            });
        };
        return SubMenu;
    }());
    exports.default = SubMenu;
});
define("olive/plugins/instantSearch", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var InstantSearch = /** @class */ (function () {
        function InstantSearch(input) {
            this.input = input;
        }
        InstantSearch.enable = function (selector) { selector.each(function (i, e) { return new InstantSearch($(e)).enable(); }); };
        InstantSearch.prototype.enable = function () {
            // TODO: Make it work with List render mode too.
            this.input.off("keyup.immediate-filter").on("keyup.immediate-filter", this.onChanged);
            this.input.on("keydown", function (e) {
                if (e.keyCode == 13)
                    e.preventDefault();
            });
        };
        InstantSearch.prototype.onChanged = function (event) {
            this.input = this.input || $(event.currentTarget);
            var keywords = this.input.val().toLowerCase().split(' ');
            var rows = this.input.closest('[data-module]').find(".grid > tbody > tr, .olive-instant-search-item");
            rows.each(function (index, e) {
                var row = $(e);
                var content = row.text().toLowerCase();
                var hasAllKeywords = keywords.filter(function (i) { return content.indexOf(i) == -1; }).length == 0;
                if (hasAllKeywords)
                    row.show();
                else
                    row.hide();
            });
        };
        return InstantSearch;
    }());
    exports.default = InstantSearch;
});
define("olive/plugins/dateDropdown", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateDropdown = /** @class */ (function () {
        function DateDropdown(input) {
            this.input = input;
        }
        DateDropdown.enable = function (selector) { selector.each(function (i, e) { return new DateDropdown($(e)).enable(); }); };
        DateDropdown.prototype.enable = function () {
            this.input.combodate({
                format: 'DD/MM/YYYY',
                template: 'DD / MMM / YYYY',
                minYear: 1985,
                maxYear: parseInt(moment().format('YYYY')),
                smartDays: true,
                firstItem: 'name'
            });
        };
        return DateDropdown;
    }());
    exports.default = DateDropdown;
});
define("olive/plugins/userHelp", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var UserHelp = /** @class */ (function () {
        function UserHelp(element) {
            element.click(function () { return false; });
            var message = element.attr('data-user-help');
            element['popover']({ trigger: 'focus', content: message, html: true });
        }
        UserHelp.enable = function (selector) { selector.each(function (i, e) { return new UserHelp($(e)); }); };
        return UserHelp;
    }());
    exports.default = UserHelp;
});
define("olive/plugins/multiSelect", ["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var MultiSelect = /** @class */ (function () {
        function MultiSelect() {
            //https://developer.snapappointments.com/bootstrap-select/
            /// TODO: this fields are obsolete and DI should use instead.
            this.defaultOptions = {
                actionsBox: true,
                liveSearch: true,
                selectedTextFormat: "count"
            };
            this.options = this.defaultOptions;
        }
        MultiSelect.prototype.enableEnhance = function (selector) {
            var _this = this;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
            selector.each(function (i, e) { return _this.enhance($(e)); });
        };
        /// TODO: this method is obsolete and DI should use instead.
        MultiSelect.prototype.setOptions = function (options) {
            console.warn('MultiSelect.setOptions is obsolete and will be removed in next version.');
            this.options = $.extend(this.defaultOptions, options);
        };
        MultiSelect.prototype.enhance = function (selectControl) {
            selectControl.selectpicker(this.options);
        };
        return MultiSelect;
    }());
    exports.default = MultiSelect;
});
define("olive/plugins/customCheckbox", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomCheckbox = /** @class */ (function () {
        function CustomCheckbox(input) {
            this.input = input;
        }
        CustomCheckbox.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) {
                if (!$(e).hasClass(_this.handledClassName))
                    new CustomCheckbox($(e)).enable();
            });
        };
        CustomCheckbox.prototype.enable = function () {
            var _this = this;
            var checkBox = $('<div class="checkbox-helper"/>');
            var toggle = function () {
                if (_this.input.attr('disabled'))
                    return;
                _this.input.prop('checked', !_this.input.is(':checked')).focus();
                _this.input.trigger('change');
            };
            checkBox.click(toggle);
            this.input.after(checkBox);
            this.input.addClass(CustomCheckbox.handledClassName);
        };
        CustomCheckbox.handledClassName = 'handled';
        return CustomCheckbox;
    }());
    exports.default = CustomCheckbox;
});
define("olive/plugins/customRadio", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CustomRadio = /** @class */ (function () {
        function CustomRadio(input) {
            this.input = input;
        }
        CustomRadio.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) {
                if (!$(e).hasClass(_this.handledClassName))
                    new CustomRadio($(e)).enable();
            });
        };
        CustomRadio.prototype.enable = function () {
            var _this = this;
            var radio = $('<div class="radio-helper"/>');
            var check = function () {
                if (_this.input.attr('disabled'))
                    return;
                _this.input.prop('checked', true).focus();
                _this.input.trigger('change');
            };
            radio.click(check);
            this.input.after(radio);
            this.input.addClass(CustomRadio.handledClassName);
        };
        CustomRadio.handledClassName = 'handled';
        return CustomRadio;
    }());
    exports.default = CustomRadio;
});
define("olive/plugins/ckEditorFileManager", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CKEditorFileManagerFactory = void 0;
    var CKEditorFileManagerFactory = /** @class */ (function () {
        function CKEditorFileManagerFactory(url) {
            this.url = url;
        }
        CKEditorFileManagerFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new CKEditorFileManager($(e), _this.url).enable(); });
        };
        return CKEditorFileManagerFactory;
    }());
    exports.CKEditorFileManagerFactory = CKEditorFileManagerFactory;
    var CKEditorFileManager = /** @class */ (function () {
        function CKEditorFileManager(item, url) {
            this.item = item;
            this.url = url;
        }
        CKEditorFileManager.prototype.enable = function () {
            var _this = this;
            this.item.on('click', function () {
                var uri = _this.item.data('download-uri');
                window.opener["CKEDITOR"].tools.callFunction(_this.url.getQuery('CKEditorFuncNum'), uri);
                window.close();
            });
        };
        return CKEditorFileManager;
    }());
    exports.default = CKEditorFileManager;
});
define("olive/components/grouping", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupingFactory = void 0;
    var GroupingFactory = /** @class */ (function () {
        function GroupingFactory(url, ajaxRedirect) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
        }
        GroupingFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (_, elem) { return new Grouping($(elem), _this.url, _this.ajaxRedirect); });
        };
        return GroupingFactory;
    }());
    exports.GroupingFactory = GroupingFactory;
    var Grouping = /** @class */ (function () {
        function Grouping(dropdown, url, ajaxRedirect) {
            var _this = this;
            this.dropdown = dropdown;
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            dropdown.on('change', function () {
                _this.ajaxRedirect.go(_this.url.updateQuery(_this.url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
            });
        }
        return Grouping;
    }());
    exports.default = Grouping;
});
define("olive/di/serviceDescription", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceDescription = void 0;
    var ServiceDescription = /** @class */ (function () {
        function ServiceDescription(key, singleton, container) {
            var _this = this;
            this.key = key;
            this.singleton = singleton;
            this.container = container;
            this.factory = function () { throw new Error("factory is not provided for type '" + _this.key + "'."); };
            this.dependencies = new Array();
            this.addDependency = function (dep) {
                _this.dependencies.push(dep);
                return _this;
            };
            this.addDependencies = function () {
                var deps = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    deps[_i] = arguments[_i];
                }
                deps.forEach(function (dep) {
                    _this.addDependency(dep);
                });
                return _this;
            };
            this.getInstance = function () {
                if (_this.singleton) {
                    if (!_this.instance) {
                        _this.instance = _this.createInstance();
                    }
                    return _this.instance;
                }
                else {
                    return _this.createInstance();
                }
            };
            this.createInstance = function () {
                var deps = _this.dependencies.map(function (k) { return _this.container.getService(k); });
                return _this.factory.apply({}, deps);
            };
        }
        ServiceDescription.prototype.setFactory = function (factory) {
            this.factory = factory;
            return this;
        };
        ServiceDescription.prototype.withDependencies = function () {
            var _this = this;
            var deps = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                deps[_i] = arguments[_i];
            }
            this.dependencies = new Array();
            deps.forEach(function (dep) {
                _this.addDependency(dep);
            });
            return this;
        };
        return ServiceDescription;
    }());
    exports.ServiceDescription = ServiceDescription;
});
define("olive/di/serviceContainer", ["require", "exports", "olive/di/serviceDescription"], function (require, exports, serviceDescription_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceContainer = void 0;
    var ServiceContainer = /** @class */ (function () {
        function ServiceContainer() {
            this.services = new Array();
        }
        ServiceContainer.prototype.tryAddSingleton = function (key, factory, serviceOut) {
            var _this = this;
            return this.try(key, serviceOut, function () { return _this.addSingleton(key, factory); });
        };
        ServiceContainer.prototype.tryAddTransient = function (key, factory, serviceOut) {
            var _this = this;
            return this.try(key, serviceOut, function () { return _this.addTransient(key, factory); });
        };
        ServiceContainer.prototype.addSingleton = function (key, factory) {
            return this.add(key, true, factory);
        };
        ;
        ServiceContainer.prototype.addTransient = function (key, factory) {
            return this.add(key, false, factory);
        };
        ServiceContainer.prototype.getService = function (key) {
            var service = this.services.filter(function (x) { return x.key === key; })[0];
            if (!!service)
                return service.getInstance();
            else
                throw new Error("No service registered for '" + key + "'.");
        };
        ServiceContainer.prototype.try = function (key, serviceOut, action) {
            if (this.services.some(function (s) { return s.key === key; })) {
                serviceOut.value = this.services.filter(function (x) { return x.key === key; })[0];
                return false;
            }
            serviceOut.value = action();
            return true;
        };
        ServiceContainer.prototype.add = function (key, singleton, factory) {
            if (this.services.some(function (s) { return s.key === key; }))
                throw new Error("A service with the same key (" + key + ") is already added");
            var result = new serviceDescription_1.ServiceDescription(key, singleton, this);
            result.setFactory(factory);
            this.services.push(result);
            return result;
        };
        return ServiceContainer;
    }());
    exports.ServiceContainer = ServiceContainer;
});
define("olive/di/services", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Services = {
        Alert: "alert",
        CrossDomainEvent: "crossDomainEvent",
        Form: "form",
        Grid: "grid",
        Grouping: "grouping",
        GroupingFactory: "groupingFactory",
        LiteEvent: "liteEvent",
        MasterDetail: "masterDetail",
        Modal: "modal",
        ModalHelper: "modalHelper",
        Paging: "paging",
        Sorting: "sorting",
        Url: "url",
        Validate: "validate",
        Waiting: "waiting",
        AjaxRedirect: "ajaxRedirect",
        WindowEx: "windowEx",
        ResponseProcessor: "responseProcessor",
        ServerInvoker: "serverInvoker",
        StandardAction: "standardAction",
        AutoComplete: "autoComplete",
        AutoCompleteFactory: "autoCompleteFactory",
        CkEditorFileManager: "ckEditorFileManager",
        CKEditorFileManagerFactory: "ckEditorFileManagerFactory",
        ConfirmBoxFactory: "confirmBoxFactory",
        ConfirmBox: "confirmBox",
        CustomCheckbox: "customCheckbox",
        CustomRadio: "customRadio",
        DateDropdown: "dateDropdown",
        DatePicker: "datePicker",
        DatePickerFactory: "datePickerFactory",
        DateTimePicker: "dateTimePicker",
        DateTimePickerFactory: "dateTimePickerFactory",
        DateTimePickerBase: "dateTimePickerBase",
        FileUpload: "fileUpload",
        FileUploadFactory: "fileUploadFactory",
        GlobalSearch: "globalSearch",
        HtmlEditor: "htmlEditor",
        HtmlEditorFactory: "htmlEditorFactory",
        InstantSearch: "instantSearch",
        MultiSelect: "multiSelect",
        NumericUpDown: "numericUpDown",
        PasswordStength: "passwordStength",
        SanityAdapter: "sanityAdapter",
        Select: "select",
        Slider: "slider",
        SliderFactory: "sliderFactory",
        SubMenu: "subMenu",
        TimeControl: "timeControl",
        TimeControlFactory: "timeControlFactory",
        UserHelp: "userHelp",
        ServiceLocator: "serviceLocator",
        GlobalSearchFactory: "GlobalSearchFactory",
        TestingContext: "TestingContext",
    };
    exports.default = Services;
});
define("olive/plugins/sanityAdapter", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SanityAdapter = /** @class */ (function () {
        function SanityAdapter() {
        }
        SanityAdapter.prototype.enable = function () {
            var _this = this;
            $(window).off('click.SanityAdapter').on('click.SanityAdapter', function (e) { return _this.skipNewWindows(e); });
        };
        SanityAdapter.prototype.skipNewWindows = function (element) {
            $(element.target).filter('a').removeAttr('target');
            window["open"] = function (url, target, features) { location.replace(url); return window; };
        };
        return SanityAdapter;
    }());
    exports.default = SanityAdapter;
});
define("olive/plugins/testingContext", ["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestingContext = /** @class */ (function () {
        function TestingContext(ajaxRedirect, modalHelper, serverInvoker) {
            this.ajaxRedirect = ajaxRedirect;
            this.modalHelper = modalHelper;
            this.serverInvoker = serverInvoker;
            this.isLoaded = false;
        }
        TestingContext.prototype.isAjaxRedirecting = function () {
            return this.ajaxRedirect.isAjaxRedirecting;
        };
        TestingContext.prototype.isOpeningModal = function () {
            var _a;
            return !!((_a = this.modalHelper.currentModal) === null || _a === void 0 ? void 0 : _a.isOpening);
        };
        TestingContext.prototype.isClosingModal = function () {
            return this.modalHelper.isClosingModal;
        };
        TestingContext.prototype.isAwaitingAjaxResponse = function () {
            return this.serverInvoker.isAwaitingAjaxResponse;
        };
        TestingContext.prototype.isOliveMvcLoaded = function () {
            return this.isLoaded;
        };
        TestingContext.prototype.onPageInitialized = function () {
            this.isLoaded = true;
        };
        return TestingContext;
    }());
    exports.default = TestingContext;
});
define("olive/olivePage", ["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/responseProcessor", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/mvc/serverInvoker", "olive/mvc/windowEx", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "olive/plugins/multiSelect", "olive/plugins/customCheckbox", "olive/plugins/customRadio", "olive/plugins/ckEditorFileManager", "olive/components/grouping", "olive/di/serviceContainer", "olive/di/services", "olive/plugins/sanityAdapter", "olive/plugins/testingContext"], function (require, exports, config_8, crossDomainEvent_4, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1, sanityAdapter_1, testingContext_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.initializeActions = [];
            this.preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            this.modal = this.getService(services_1.default.ModalHelper);
            this.waiting = this.getService(services_1.default.Waiting);
            window.testingContext = this.getService(services_1.default.TestingContext);
            this.initializeServices();
            // ASP.NET needs this config for Request.IsAjaxRequest()
            $.ajaxSetup({
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            $(function () {
                // $.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS,
                //      { backdrop: this.DEFAULT_MODAL_BACKDROP });
                // $.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                _this.getService(services_1.default.Alert).enableAlert();
                _this.getService(services_1.default.Validate).configure();
                _this.onViewChanged(null, null, true, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            this.getService(services_1.default.ResponseProcessor)
                .viewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_4.default.handle("refresh-page", function (x) { return _this.refresh(); });
        }
        OlivePage.prototype.initializeServices = function () {
            this.modal.initialize();
            this.getService(services_1.default.StandardAction).initialize();
            this.getService(services_1.default.Validate).initialize();
            this.getService(services_1.default.MasterDetail).initialize();
        };
        OlivePage.prototype.configureServices = function (services) {
            var _this = this;
            var out = {};
            services.tryAddSingleton(services_1.default.ServiceLocator, function () { return _this; }, out);
            services.tryAddSingleton(services_1.default.ConfirmBoxFactory, function () { return new confirmBox_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Alert, function () { return new alert_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Url, function () { return new url_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Grid, function () { return new grid_1.default(); }, out);
            services.tryAddSingleton(services_1.default.MultiSelect, function () { return new multiSelect_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Select, function () { return new select_1.default(); }, out);
            services.tryAddSingleton(services_1.default.ResponseProcessor, function () { return new responseProcessor_1.default(); }, out);
            services.tryAddSingleton(services_1.default.SanityAdapter, function () { return new sanityAdapter_1.default(); }, out);
            if (services.tryAddSingleton(services_1.default.Waiting, function (url) { return new waiting_1.default(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.GlobalSearchFactory, function (waiting) { return new globalSearch_1.GlobalSearchFactory(waiting, _this.getService(services_1.default.ModalHelper)); }, out)) {
                out.value.withDependencies(services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.CKEditorFileManagerFactory, function (url) { return new ckEditorFileManager_1.CKEditorFileManagerFactory(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.Sorting, function (url, serverInvoker) { return new sorting_1.default(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.Paging, function (url, serverInvoker) { return new paging_1.default(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.FileUploadFactory, function (url, serverInvoker) { return new fileUpload_1.FileUploadFactory(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.GroupingFactory, function (url, ajaxRedirect) { return new grouping_1.GroupingFactory(url, ajaxRedirect); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.ModalHelper, function (url, ajaxRedirect, responseProcessor) {
                return new modal_1.ModalHelper(url, ajaxRedirect, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.WindowEx, function (modalHelper, ajaxRedirect) { return new windowEx_1.default(modalHelper, ajaxRedirect); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.AutoCompleteFactory, function (url, form, serverInvoker) {
                return new autoComplete_1.AutoCompleteFactory(url, form, serverInvoker);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Form, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.SliderFactory, function (form) { return new slider_1.SliderFactory(form); }, out)) {
                out.value.withDependencies(services_1.default.Form);
            }
            if (services.tryAddSingleton(services_1.default.HtmlEditorFactory, function (modalHelper) { return new htmlEditor_1.HtmlEditorFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DateTimePickerFactory, function (modalHelper) { return new dateTimePicker_1.DateTimePickerFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DatePickerFactory, function (modalHelper) { return new datePicker_1.DatePickerFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.TimeControlFactory, function (modalHelper) { return new timeControl_1.TimeControlFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.AjaxRedirect, function (url, responseProcessor, waiting) {
                return new ajaxRedirect_1.default(url, responseProcessor, waiting);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ResponseProcessor, services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.Form, function (url, validate, waiting, ajaxRedirect) {
                return new form_1.default(url, validate, waiting, ajaxRedirect);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.Validate, function (alert, responseProcessor) {
                return new validate_1.default(alert, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.MasterDetail, function (validate, responseProcessor) {
                return new masterDetail_1.default(validate, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Validate, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.TestingContext, function (ajaxRedirect, modalHelper, serverInvoker) {
                return new testingContext_1.default(ajaxRedirect, modalHelper, serverInvoker);
            }, out)) {
                out.value.withDependencies(services_1.default.AjaxRedirect, services_1.default.ModalHelper, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.StandardAction, function (alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, serviceLocator) {
                return new standardAction_1.default(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, serviceLocator);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.Form, services_1.default.Waiting, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor, services_1.default.Select, services_1.default.ModalHelper, services_1.default.ServiceLocator);
            }
            if (services.tryAddSingleton(services_1.default.ServerInvoker, function (url, validate, waiting, form, responseProcessor) {
                return new serverInvoker_1.default(url, validate, waiting, form, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.Form, services_1.default.ResponseProcessor);
            }
        };
        OlivePage.prototype.fixAlertIssues = function () {
            if (!$.fn.tooltip.Constructor) {
                $.fn.tooltip.Constructor = {};
            }
            window.alertify = window.require("alertify")();
        };
        OlivePage.prototype.onInit = function (action) { this.initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this.preInitializeActions.push(action); };
        OlivePage.prototype.onViewChanged = function (container, trigger, newPage, firstTime) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (newPage === void 0) { newPage = false; }
            if (firstTime === void 0) { firstTime = false; }
            var standardAction = this.getService(services_1.default.StandardAction);
            standardAction.runStartup(container, trigger, "PreInit");
            try {
                this.initialize();
            }
            catch (error) {
                alert("initialization failed: " + error);
            }
            standardAction.runStartup(container, trigger, "Init");
            if (newPage) {
                $("[autofocus]:not([data-autofocus=disabled]):first").focus();
                if (config_8.default.REDIRECT_SCROLLS_UP) {
                    $(window).scrollTop(0);
                }
            }
            //if (firstTime) { this.modal.tryOpenFromUrl(); }
        };
        OlivePage.prototype.initialize = function () {
            this.preInitializeActions.forEach(function (action) { return action(); });
            // =================== Standard Features ====================
            var grid = this.getService(services_1.default.Grid);
            grid.mergeActionButtons();
            grid.enableColumn($(".select-cols .apply"));
            grid.enableSelectCol($(".select-grid-cols .group-control"));
            grid.enableToggle($("th.select-all > input:checkbox"));
            this.getService(services_1.default.MasterDetail).enable($("[data-delete-subform]"));
            var paging = this.getService(services_1.default.Paging);
            paging.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
            var sorting = this.getService(services_1.default.Sorting);
            sorting.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
            paging.enableWithAjax($("a[data-pagination]"));
            sorting.enableAjaxSorting($("a[data-sort]"));
            sorting.setSortHeaderClass($("th[data-sort]"));
            var form = this.getService(services_1.default.Form);
            this.enablecleanUpNumberField(form);
            this.modal.enableEnsureHeight($("[data-toggle=tab]"));
            this.getService(services_1.default.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
            this.getService(services_1.default.Select)
                .enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_1.default.ModalHelper).enableLink($("[target='$modal'][href]"));
            this.getService(services_1.default.GroupingFactory).enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            this.getService(services_1.default.AutoCompleteFactory).enable($("input[autocomplete-source]"));
            this.getService(services_1.default.CKEditorFileManagerFactory)
                .enable($(".ckeditor-file-uri"));
            this.getService(services_1.default.GlobalSearchFactory).enable($("input[data-search-source]"));
            this.getService(services_1.default.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
            this.getService(services_1.default.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
            this.getService(services_1.default.TimeControlFactory).enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            this.getService(services_1.default.HtmlEditorFactory).enable($("[data-control=html-editor]"));
            numericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            this.getService(services_1.default.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
            this.getService(services_1.default.FileUploadFactory).enable($(".file-upload input:file"));
            this.getService(services_1.default.ConfirmBoxFactory).enable($("[data-confirm-question]"));
            passwordStength_1.default.enable($(".password-strength"));
            subMenu_1.default.enable($(".with-submenu"));
            subMenu_1.default.createAccordion($("ul.accordion"));
            this.enableCustomCheckbox();
            this.enableCustomRadio();
            this.customizeValidationTooltip();
            // =================== Request lifecycle ====================
            this.getService(services_1.default.WindowEx).enableBack($(window));
            this.getService(services_1.default.AjaxRedirect).enableRedirect($("a[data-redirect=ajax]"));
            form.enablesubmitCleanGet($("form[method=get]"));
            var formAction = this.getService(services_1.default.ServerInvoker);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_1.default.MasterDetail).updateSubFormStates();
            this.modal.adjustHeight();
            this.initializeActions.forEach(function (action) { return action(); });
            $(this).trigger("initialized");
            window.testingContext.onPageInitialized();
            try {
                $.validator.unobtrusive.parse("form");
            }
            catch (error) {
                console.error(error);
            }
        };
        OlivePage.prototype.enableCustomCheckbox = function () {
            var all = $("input[type=checkbox]");
            var shouldSkip = $(".as-buttons-input input[type=checkbox]");
            customCheckbox_1.default.enable(all.not(shouldSkip));
        };
        OlivePage.prototype.enablecleanUpNumberField = function (form) {
            form.enablecleanUpNumberField($("[data-val-number]"));
        };
        OlivePage.prototype.enableCustomRadio = function () {
            var all = $("input[type=radio]");
            var shouldSkip = $(".as-buttons-input input[type=radio]");
            customRadio_1.default.enable(all.not(shouldSkip));
        };
        OlivePage.prototype.goBack = function (target) {
            var url = this.getService(services_1.default.Url);
            var returnUrl = url.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]")) {
                var link = $(target);
                if (link != undefined && link != null) {
                    var ajaxTarget = link.attr("ajax-target");
                    var ajaxhref = link.attr("href");
                    this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true, undefined, ajaxTarget, ajaxhref);
                }
                else {
                    this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true);
                }
            }
            else {
                url.goBack();
            }
            return false;
        };
        OlivePage.prototype.customizeValidationTooltip = function () { };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            // if ($("main").length === 1 || $("main").length === 2) {
            //     // if there is an ajax modal available, then we have 2 main elements.
            //     this.getService<AjaxRedirect>(Services.AjaxRedirect)
            //         .go(location.href, null, false /*isBack*/, keepScroll, false);
            // } else {
            //     location.reload();
            // }
            location.reload();
            return false;
        };
        OlivePage.prototype.getService = function (key) {
            return this.services.getService(key);
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
// import Waiting from 'olive/components/waiting'
// import { ModalHelper } from 'olive/components/modal';
// import LiteEvent from 'olive/components/liteEvent';
// import Form from 'olive/components/form';
// import Select from 'olive/plugins/select';
// import CrossDomainEvent from 'olive/components/crossDomainEvent';
// import Alert from 'olive/components/alert';
// import ResponseProcessor from './responseProcessor';
// import ServerInvoker from './serverInvoker';
// import AjaxRedirect from './ajaxRedirect';
// import StandardAction from './standardAction';
// export default class CombinedUtilities implements IService {
//     constructor(
//         private waiting: Waiting,
//         private modalHelper: ModalHelper,
//         private form: Form,
//         private select: Select,
//         private alert: Alert,
//         protected responseProcessor: ResponseProcessor,
//         private serverInvoker: ServerInvoker,
//         private ajaxRedirect: AjaxRedirect,
//         private standardAction: StandardAction
//     ) { }
//     public onViewChanged = new LiteEvent<IViewUpdatedEventArgs>();
//     public enableInvokeWithAjax(selector: JQuery, event: string, attrName: string) { this.serverInvoker.enableInvokeWithAjax(selector, event, attrName); }
//     public enableinvokeWithPost(selector: JQuery) { this.serverInvoker.enableinvokeWithPost(selector); }
//     public invokeWithAjax(event, actionUrl, syncCall = false) { this.serverInvoker.invokeWithAjax(event, actionUrl, syncCall); }
// }
// import Waiting from 'olive/components/waiting'
// import Validate from 'olive/components/validate'
// import MasterDetail from 'olive/components/masterDetail'
// import Form from 'olive/components/form'
// import Url from 'olive/components/url'
// import Config from "olive/config"
// import StandardAction from 'olive/mvc/standardAction'
// import LiteEvent from 'olive/components/liteEvent'
// import { ModalHelper } from '../components/modal';
// export interface IViewUpdatedEventArgs {
//     container: JQuery;
//     trigger: any;
//     isNewPage: boolean;
// }
// export default class FormAction implements IService {
//     public isAwaitingAjaxResponse_fa = false;
//     public events_fa: { [event: string]: Function[] } = {};
//     private dynamicallyLoadedScriptFiles_fa = [];
//     public onViewChanged_fa = new LiteEvent<IViewUpdatedEventArgs>();
//     constructor(
//         private url: Url,
//         private validate: Validate,
//         private masterDetail: MasterDetail,
//         private standardAction: StandardAction,
//         private form: Form,
//         private waiting: Waiting,
//         private modalHelper: ModalHelper) { }
//     public enableInvokeWithAjax_fa(selector: JQuery, event: string, attrName: string) {
//         selector.off(event).on(event,
//             (e) => {
//                 let trigger = $(e.currentTarget);
//                 let url = this.url.effectiveUrlProvider(trigger.attr(attrName), trigger);
//                 this.invokeWithAjax_fa(e, url, false);
//                 return false;
//             });
//     }
//     public enableinvokeWithPost_fa(selector: JQuery) { selector.off("click.formaction").on("click.formaction", (e) => this.invokeWithPost_fa(e)); }
//     private invokeWithPost_fa(event) {
//         let trigger = $(event.currentTarget);
//         let containerModule = trigger.closest("[data-module]");
//         if (containerModule.is("form") && this.validate.validateForm(trigger) == false) return false;
//         let data = this.form.getPostData(trigger);
//         let url = this.url.effectiveUrlProvider(trigger.attr("formaction"), trigger);
//         let form = $("<form method='post' />").hide().appendTo($("body"));
//         for (let item of data)
//             $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
//         form.attr("action", url).submit();
//         return false;
//     }
//     public invokeWithAjax_fa(event, actionUrl, syncCall = false) {
//         let trigger = $(event.currentTarget);
//         let triggerUniqueSelector: string = trigger.getUniqueSelector();
//         let containerModule = trigger.closest("[data-module]");
//         if (this.validate.validateForm(trigger) == false) { this.waiting.hide(); return false; }
//         let data_before_disable = this.form.getPostData(trigger);
//         let disableToo = Config.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
//         if (disableToo) trigger.attr('disabled', 'disabled');
//         trigger.addClass('loading-action-result');
//         this.isAwaitingAjaxResponse_fa = true;
//         actionUrl = this.url.effectiveUrlProvider(actionUrl, trigger);
//         // If the request is cross domain, jquery won't send the header: X-Requested-With
//         data_before_disable = data_before_disable.concat({ name: ".Olive-Requested-With", value: "XMLHttpRequest" });
//         const scrollPosition = $(window).scrollTop();
//         $.ajax({
//             url: actionUrl,
//             type: trigger.attr("data-ajax-method") || 'POST',
//             xhrFields: { withCredentials: true },
//             async: !syncCall,
//             data: data_before_disable,
//             success: (result) => { $(".tooltip").remove(); this.waiting.hide(); this.processAjaxResponse_fa(result, containerModule, trigger, null); },
//             error: this.onAjaxResponseError_fa,
//             statusCode: {
//                 401: (data) => {
//                     this.url.onAuthenticationFailed();
//                 }
//             },
//             complete: (x) => {
//                 this.isAwaitingAjaxResponse_fa = false;
//                 trigger.removeClass('loading-action-result');
//                 if (disableToo) trigger.removeAttr('disabled');
//                 let triggerTabIndex: number = $(":focusable").not("[tabindex='-1']").index($(triggerUniqueSelector));
//                 if (!trigger.is("button") && !trigger.is("a")) {
//                     //trigger element is not a button, image or link so we should select next element.
//                     triggerTabIndex++;
//                 }
//                 if (triggerTabIndex > -1) $(":focusable").not("[tabindex='-1']").eq(triggerTabIndex).focus();
//                 $(window).scrollTop(scrollPosition);
//             }
//         });
//         return false;
//     }
//     public onAjaxResponseError_fa(jqXHR: JQueryXHR, status: string, error: string) {
//         this.waiting.hide();
//         let text = jqXHR.responseText;
//         if (text) {
//             if (text.indexOf("<html") > -1) {
//                 document.write(text);
//             }
//             else if (text.indexOf("<form") > -1) {
//                 let form = $("form", document);
//                 if (form.length) form.replaceWith($(text));
//                 else document.write(text);
//             }
//             else alert(text);
//         }
//         else if (error) alert(error);
//         else alert("Error: response status: " + status);
//     }
//     public processAjaxResponse_fa(response, containerModule, trigger, args) {
//         let asElement = $(response);
//         if (asElement.is("main")) {
//             this.navigate_fa(asElement, trigger, args);
//             return;
//         }
//         if (asElement.is("[data-module]")) {
//             containerModule.replaceWith(asElement);
//             this.raiseViewChanged_fa(asElement, trigger);
//             return;
//         }
//         if (response.length == 1 && response[0].ReplaceView) {
//             asElement = $("<div/>").append(response[0].ReplaceView);
//             containerModule.replaceWith(asElement);
//             this.raiseViewChanged_fa(asElement, trigger);
//             return;
//         }
//         if (trigger && trigger.is("[data-add-subform]")) {
//             let subFormName = trigger.attr("data-add-subform");
//             let container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
//             if (container.length == 0)
//                 container = containerModule.find("[data-subform=" + subFormName + "]:first");
//             container.append(asElement);
//             this.validate.reloadRules(trigger.parents("form"));
//             this.masterDetail.updateSubFormStates();
//             this.raiseViewChanged_fa(asElement, trigger);
//             return;
//         }
//         // List of actions
//         this.standardAction.runAll_sa(response, trigger);
//     }
//     private raiseViewChanged_fa(container, trigger, isNewPage: boolean = false) {
//         this.onViewChanged_fa.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
//     }
//     private navigate_fa(element: JQuery, trigger, args) {
//         let referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
//         let referencedCss = element.find("link[rel='stylesheet']").map((i, s) => $(s).attr("href"));
//         element.find("script[src]").remove();
//         element.find("link[rel='stylesheet']").remove();
//         //check for CSS links in the main tag after ajax call
//         if (referencedCss.length > 0) {
//             let contentLoaded: boolean = false;
//             referencedCss.each((i, item: any) => {
//                 if (!contentLoaded) {
//                     //first add CSS files and then load content.
//                     $("head").append($('<link rel="stylesheet" type="text/css" />')
//                         .attr("href", item).load(item, () => { this.processWithTheContent_fa(trigger, element, args, referencedScripts); }));
//                     contentLoaded = true;
//                 }
//                 else if ($("link[href='" + item + "']") && $("link[href='" + item + "']").length === 0) {
//                     $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", item));
//                 }
//             });
//         }
//         else
//             this.processWithTheContent_fa(trigger, element, args, referencedScripts);
//     }
//     private processWithTheContent_fa(trigger, element, args, referencedScripts) {
//         let width = $(window).width();
//         let oldMain = trigger.closest("main");
//         if (oldMain.length === 0) oldMain = $("main");
//         let tooltips = $('body > .tooltip');
//         tooltips.each((index, elem) => {
//             if ($('[aria-discribedby=' + elem.id + ']'))
//                 elem.remove();
//         });
//         if (width <= 800 && trigger.data("transition") == "slide") {
//             let newMain = element.appendTo(oldMain.parent());
//             oldMain.css("position", "fixed");
//             if (args == "back") {
//                 newMain.addClass("w3-animate-left");
//                 oldMain.addClass("w3-animate-righter");
//             }
//             else {
//                 newMain.addClass("w3-animate-right");
//                 oldMain.addClass("w3-animate-lefter");
//             }
//             setTimeout(function () {
//                 oldMain.remove();
//                 newMain.removeClass("w3-animate-left").removeClass("w3-animate-right");
//                 this.updateUrl(referencedScripts, element, trigger);
//             }, 400);
//         }
//         else {
//             oldMain.replaceWith(element);
//             this.updateUrl_fa(referencedScripts, element, trigger);
//         }
//     }
//     private updateUrl_fa(referencedScripts, element, trigger) {
//         if (referencedScripts.length) {
//             let expectedScripts = referencedScripts.length;
//             let loadedScripts = 0;
//             referencedScripts.each((index, item) => {
//                 let url = '' + item;
//                 if (this.dynamicallyLoadedScriptFiles_fa.indexOf(url) > -1) {
//                     loadedScripts++;
//                     if (loadedScripts == expectedScripts)
//                         this.raiseViewChanged_fa(element, trigger, true);
//                 }
//                 else {
//                     this.dynamicallyLoadedScriptFiles_fa.push(url);
//                     $.getScript(url, () => {
//                         loadedScripts++;
//                         if (loadedScripts == expectedScripts)
//                             this.raiseViewChanged_fa(element, trigger, true);
//                     });
//                 }
//             });
//         }
//         else this.raiseViewChanged_fa(element, trigger, true);
//         document.title = $("#page_meta_title").val();
//         //open modal if needed
//         this.modalHelper.tryOpenFromUrl();
//         //if (!window.isModal() && Url.getQuery("_modal") !== "") {
//         //    let url: string = Url.getQuery("_modal");
//         //    new Modal(null, url).open(false);
//         //}
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiLCIuLi9zcmMvY29tcG9uZW50cy9saXRlRXZlbnQudHMiLCIuLi9zcmMvbXZjL3Jlc3BvbnNlUHJvY2Vzc29yLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvdXJsLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvd2FpdGluZy50cyIsIi4uL3NyYy9tdmMvYWpheFJlZGlyZWN0LnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvYWxlcnQudHMiLCIuLi9zcmMvcGx1Z2lucy9zZWxlY3QudHMiLCIuLi9zcmMvY29tcG9uZW50cy9tb2RhbC50cyIsIi4uL3NyYy9jb21wb25lbnRzL3ZhbGlkYXRlLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvZm9ybS50cyIsIi4uL3NyYy9tdmMvc3RhbmRhcmRBY3Rpb24udHMiLCIuLi9zcmMvbXZjL3NlcnZlckludm9rZXIudHMiLCIuLi9zcmMvbXZjL3dpbmRvd0V4LnRzIiwiLi4vc3JjL2V4dGVuc2lvbnMvalF1ZXJ5RXh0ZW5zaW9ucy50cyIsIi4uL3NyYy9leHRlbnNpb25zL3N5c3RlbUV4dGVuc2lvbnMudHMiLCIuLi9zcmMvY29tcG9uZW50cy9zb3J0aW5nLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvcGFnaW5nLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvbWFzdGVyRGV0YWlsLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvZ3JpZC50cyIsIi4uL3NyYy9wbHVnaW5zL3Bhc3N3b3JkU3Rlbmd0aC50cyIsIi4uL3NyYy9wbHVnaW5zL2h0bWxFZGl0b3IudHMiLCIuLi9zcmMvcGx1Z2lucy90aW1lQ29udHJvbC50cyIsIi4uL3NyYy9wbHVnaW5zL2F1dG9Db21wbGV0ZS50cyIsIi4uL3NyYy9wbHVnaW5zL2dsb2JhbFNlYXJjaC50cyIsIi4uL3NyYy9wbHVnaW5zL3NsaWRlci50cyIsIi4uL3NyYy9wbHVnaW5zL2RhdGVUaW1lUGlja2VyQmFzZS50cyIsIi4uL3NyYy9wbHVnaW5zL2RhdGVQaWNrZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlci50cyIsIi4uL3NyYy9wbHVnaW5zL251bWVyaWNVcERvd24udHMiLCIuLi9zcmMvcGx1Z2lucy9maWxlVXBsb2FkLnRzIiwiLi4vc3JjL3BsdWdpbnMvY29uZmlybUJveC50cyIsIi4uL3NyYy9wbHVnaW5zL3N1Yk1lbnUudHMiLCIuLi9zcmMvcGx1Z2lucy9pbnN0YW50U2VhcmNoLnRzIiwiLi4vc3JjL3BsdWdpbnMvZGF0ZURyb3Bkb3duLnRzIiwiLi4vc3JjL3BsdWdpbnMvdXNlckhlbHAudHMiLCIuLi9zcmMvcGx1Z2lucy9tdWx0aVNlbGVjdC50cyIsIi4uL3NyYy9wbHVnaW5zL2N1c3RvbUNoZWNrYm94LnRzIiwiLi4vc3JjL3BsdWdpbnMvY3VzdG9tUmFkaW8udHMiLCIuLi9zcmMvcGx1Z2lucy9ja0VkaXRvckZpbGVNYW5hZ2VyLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvZ3JvdXBpbmcudHMiLCIuLi9zcmMvZGkvc2VydmljZURlc2NyaXB0aW9uLnRzIiwiLi4vc3JjL2RpL3NlcnZpY2VDb250YWluZXIudHMiLCIuLi9zcmMvZGkvc2VydmljZXMudHMiLCIuLi9zcmMvcGx1Z2lucy9zYW5pdHlBZGFwdGVyLnRzIiwiLi4vc3JjL3BsdWdpbnMvdGVzdGluZ0NvbnRleHQudHMiLCIuLi9zcmMvb2xpdmVQYWdlLnRzIiwiLi4vc3JjL2RpL0lTZXJ2aWNlLnRzIiwiLi4vc3JjL2RpL2lTZXJ2aWNlTG9jYXRvci50cyIsIi4uL3NyYy9kaS9vdXRQYXJhbS50cyIsIi4uL3NyYy9tdmMvY29tYmluZWRVdGlsaXRpZXMudHMiLCIuLi9zcmMvbXZjL2Zvcm1BY3Rpb24udHMiLCIuLi9zcmMvbXZjL2lJbnZvY2F0aW9uQ29udGV4dC50cyIsIi4uL3NyYy9tdmMvaW50ZXJmYWNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdz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