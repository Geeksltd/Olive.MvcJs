var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("config", ["require", "exports"], function (require, exports) {
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
define("components/crossDomainEvent", ["require", "exports"], function (require, exports) {
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
define("components/liteEvent", ["require", "exports"], function (require, exports) {
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
define("mvc/responseProcessor", ["require", "exports", "components/liteEvent"], function (require, exports, liteEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ResponseProcessor = /** @class */ (function () {
        function ResponseProcessor() {
            this.dynamicallyLoadedScriptFiles = [];
            this.subformChanged = new liteEvent_1.default();
            this.viewChanged = new liteEvent_1.default();
            this.processCompleted = new liteEvent_1.default();
            this.nothingFoundToProcess = new liteEvent_1.default();
        }
        ResponseProcessor.prototype.processAjaxResponse = function (response, containerModule, trigger, args) {
            var asElement = $(response);
            asElement = this.fixUrlsForOpenNewWindows(response);
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
        ResponseProcessor.prototype.fixUrlForOpenNewWindows = function (url) {
            if (url.startsWith("http"))
                return url;
            var service = $("service[of]").attr("of");
            if (service == "hub" || service == undefined || service == null)
                return url;
            if (url.startsWith("/"))
                url = "/" + service + url;
            else
                url = "/" + service + "/" + url;
            return url;
        };
        ResponseProcessor.prototype.fixElementForOpenNewWindows = function (element) {
            if ($(element).closest(".hub-service").length > 0)
                return;
            if ($(element).closest("service[of]").length > 0) {
                var url = element.attr("href");
                if (!url.startsWith("http")) {
                    element.attr("ajax-href", url);
                    url = this.fixUrlForOpenNewWindows(url);
                    element.attr("ajax-href", url);
                }
            }
        };
        ResponseProcessor.prototype.fixUrlsForOpenNewWindows = function (response) {
            var asElement = $(response);
            if ($(element).closest(".hub-service").length > 0 || asElement.hasClass("hub-service") || $(asElement).attr("data-module") == "MYPriorityView")
                return asElement;
            var aTags = asElement.find("a:not([target='$modal'])");
            for (var i = 0; i < aTags.length; i++) {
                var element = aTags.get(i);
                var url = $(element).attr("href");
                if (url != undefined && url != null) {
                    $(element).attr("ajax-href", url);
                    url = this.fixUrlForOpenNewWindows(url);
                    $(element).attr("href", url);
                }
            }
            return asElement;
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
            var _this = this;
            var referencedScripts = element.find("script[src]").map(function (i, s) { return $(s).attr("src"); });
            var newCss = this.getNewCss(element);
            element.find("script[src]").remove();
            element.find("link[rel=stylesheet]").remove();
            // Process when at least one css is loaded.
            if (newCss.length > 0) {
                var tags = newCss.map(function (item) { return $('<link rel="stylesheet" type="text/css" />').attr("href", item); });
                tags[0].on('load', function () { return _this.processWithTheContent(trigger, element, args, referencedScripts); });
                $("head").append(tags);
            }
            else
                this.processWithTheContent(trigger, element, args, referencedScripts);
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
define("components/url", ["require", "exports"], function (require, exports) {
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
define("components/waiting", ["require", "exports"], function (require, exports) {
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
                .fadeIn('slow');
        };
        Waiting.prototype.hide = function () {
            $(".wait-screen").remove();
        };
        return Waiting;
    }());
    exports.default = Waiting;
});
define("mvc/ajaxRedirect", ["require", "exports"], function (require, exports) {
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
            var ajaxUrl = link.attr("ajax-href");
            if (ajaxUrl != null && ajaxUrl != undefined)
                url = ajaxUrl;
            this.go(url, link, false, false, true);
            return false;
        };
        AjaxRedirect.prototype.go = function (url, trigger, isBack, keepScroll, addToHistory, onComplete) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            if (!trigger) {
                trigger = $(window);
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
                    // this.formAction.events_fa = {};
                    if (!isBack) {
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
                    _this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null);
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
define("components/alert", ["require", "exports"], function (require, exports) {
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
define("plugins/select", ["require", "exports", "bootstrap-select"], function (require, exports) {
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
define("components/modal", ["require", "exports", "components/crossDomainEvent"], function (require, exports, crossDomainEvent_1) {
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
define("components/validate", ["require", "exports", "config"], function (require, exports, config_1) {
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
define("components/form", ["require", "exports"], function (require, exports) {
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
                    this.ajaxRedirect.go(url, form, false, false, true);
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
define("mvc/standardAction", ["require", "exports", "components/crossDomainEvent"], function (require, exports, crossDomainEvent_2) {
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
                        _this.responseProcessor.processAjaxResponse(response, opener_1.closest("[data-module]"), opener_1, null);
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
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
                this.ajaxRedirect.go(action.Redirect, trigger, false, false, true);
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
define("mvc/serverInvoker", ["require", "exports", "config"], function (require, exports, config_2) {
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
                success: function (result) { $(".tooltip").remove(); _this.waiting.hide(); _this.responseProcessor.processAjaxResponse(result, containerModule, trigger, null); },
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
define("mvc/windowEx", ["require", "exports"], function (require, exports) {
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
                this.ajaxRedirect.go(location.href, null, true, false, false);
            }
        };
        return WindowEx;
    }());
    exports.default = WindowEx;
});
define("extensions/jQueryExtensions", ["require", "exports"], function (require, exports) {
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
define("extensions/systemExtensions", ["require", "exports", "extensions/jQueryExtensions"], function (require, exports, jq) {
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
define("components/sorting", ["require", "exports", "jquery-sortable"], function (require, exports) {
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
define("components/paging", ["require", "exports"], function (require, exports) {
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
define("components/masterDetail", ["require", "exports"], function (require, exports) {
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
define("components/grid", ["require", "exports"], function (require, exports) {
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
define("plugins/passwordStength", ["require", "exports"], function (require, exports) {
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
define("plugins/htmlEditor", ["require", "exports", "config"], function (require, exports, config_3) {
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
define("plugins/timeControl", ["require", "exports", "config"], function (require, exports, config_4) {
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
define("plugins/autoComplete", ["require", "exports"], function (require, exports) {
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
define("plugins/globalSearch", ["require", "exports"], function (require, exports) {
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
                    panel.fadeIn('fast');
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
                resultPanel.empty().fadeIn('fast');
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
define("plugins/slider", ["require", "exports"], function (require, exports) {
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
define("plugins/dateTimePickerBase", ["require", "exports", "config"], function (require, exports, config_5) {
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
define("plugins/datePicker", ["require", "exports", "config", "plugins/dateTimePickerBase"], function (require, exports, config_6, dateTimePickerBase_1) {
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
                viewMode: this.input.attr("data-view-mode") || 'days'
            });
        };
        return DatePicker;
    }(dateTimePickerBase_1.default));
    exports.default = DatePicker;
});
define("plugins/dateTimePicker", ["require", "exports", "plugins/dateTimePickerBase", "config"], function (require, exports, dateTimePickerBase_2, config_7) {
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
            });
        };
        return DateTimePicker;
    }(dateTimePickerBase_2.default));
    exports.default = DateTimePicker;
});
define("plugins/numericUpDown", ["require", "exports"], function (require, exports) {
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
define("plugins/fileUpload", ["require", "exports", "components/crossDomainEvent", "file-style"], function (require, exports, crossDomainEvent_3) {
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
define("plugins/confirmBox", ["require", "exports"], function (require, exports) {
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
define("plugins/subMenu", ["require", "exports"], function (require, exports) {
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
define("plugins/instantSearch", ["require", "exports"], function (require, exports) {
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
define("plugins/dateDropdown", ["require", "exports"], function (require, exports) {
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
define("plugins/userHelp", ["require", "exports"], function (require, exports) {
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
define("plugins/multiSelect", ["require", "exports", "bootstrap-select"], function (require, exports) {
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
define("plugins/customCheckbox", ["require", "exports"], function (require, exports) {
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
define("plugins/customRadio", ["require", "exports"], function (require, exports) {
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
define("plugins/ckEditorFileManager", ["require", "exports"], function (require, exports) {
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
                window.opener.CKEDITOR.tools.callFunction(_this.url.getQuery('CKEditorFuncNum'), uri);
                window.close();
            });
        };
        return CKEditorFileManager;
    }());
    exports.default = CKEditorFileManager;
});
define("components/grouping", ["require", "exports"], function (require, exports) {
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
define("di/serviceDescription", ["require", "exports"], function (require, exports) {
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
define("di/serviceContainer", ["require", "exports", "di/serviceDescription"], function (require, exports, serviceDescription_1) {
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
define("di/services", ["require", "exports"], function (require, exports) {
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
define("plugins/sanityAdapter", ["require", "exports"], function (require, exports) {
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
            window["open"] = function (url, r, f, re) { location.replace(url); return window; };
        };
        return SanityAdapter;
    }());
    exports.default = SanityAdapter;
});
define("plugins/testingContext", ["require", "exports"], function (require, exports) {
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
define("olivePage", ["require", "exports", "config", "components/crossDomainEvent", "mvc/responseProcessor", "mvc/ajaxRedirect", "mvc/standardAction", "mvc/serverInvoker", "mvc/windowEx", "components/form", "components/url", "extensions/systemExtensions", "components/modal", "components/validate", "components/sorting", "components/paging", "components/masterDetail", "components/alert", "components/waiting", "components/grid", "plugins/select", "plugins/passwordStength", "plugins/htmlEditor", "plugins/timeControl", "plugins/autoComplete", "plugins/globalSearch", "plugins/slider", "plugins/datePicker", "plugins/dateTimePicker", "plugins/numericUpDown", "plugins/fileUpload", "plugins/confirmBox", "plugins/subMenu", "plugins/instantSearch", "plugins/dateDropdown", "plugins/userHelp", "plugins/multiSelect", "plugins/customCheckbox", "plugins/customRadio", "plugins/ckEditorFileManager", "components/grouping", "di/serviceContainer", "di/services", "plugins/sanityAdapter", "plugins/testingContext"], function (require, exports, config_8, crossDomainEvent_4, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1, sanityAdapter_1, testingContext_1) {
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
                this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true);
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