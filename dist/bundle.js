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
            if (oldMain != undefined && oldMain != null && oldMain.length > 0) {
                var mainName = oldMain[0].className;
                if (mainName != undefined && mainName != null && mainName.length > 0) {
                    var validNode = false;
                    var SimilarNodes = document.getElementsByTagName("MAIN");
                    for (var i = 0; i < SimilarNodes.length; ++i) {
                        var SimilarNode = SimilarNodes[i];
                        if (SimilarNode.className == mainName) {
                            validNode = true;
                            break;
                        }
                    }
                    if (validNode == false)
                        oldMain = null;
                }
            }
            if (oldMain == undefined || oldMain == null || oldMain.length === 0)
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
define("olive/components/url", ["require", "exports", "pako/dist/pako"], function (require, exports, pako) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Url = /** @class */ (function () {
        function Url() {
            this.effectiveUrlProvider = function (u, t) { return u; };
            this.onAuthenticationFailed = this.goToLoginPage;
            this.baseContentUrl = window["BaseThemeUrl"] || '/';
        }
        Url.prototype.decodeGzipUrl = function (inputUrl) {
            if (inputUrl === undefined || inputUrl === null)
                return inputUrl;
            var tempUrl = inputUrl;
            if (tempUrl.toLowerCase().contains("returnurl=")) {
                new URLSearchParams(inputUrl).forEach(function (name, value) {
                    if (name.toLowerCase() == 'returnurl') {
                        tempUrl = value;
                    }
                });
            }
            if (tempUrl.startsWith("...") == false)
                return inputUrl;
            var encodedUrl = tempUrl.substring(3).replace(new RegExp("%7E", 'g'), "~").replace(new RegExp("~", 'g'), "+").replace(new RegExp("_", 'g'), "/").replace(new RegExp("-", 'g'), "=");
            if (encodedUrl === null || encodedUrl.length <= 0)
                return;
            var binaryArray = Uint8Array.from(atob(encodedUrl), function (c) { return c.charCodeAt(0); });
            var unzippedBinaryArray = pako.ungzip(binaryArray);
            var decodedString = String.fromCharCode.apply(null, unzippedBinaryArray);
            decodedString = decodedString.replace('&', '%26');
            if (inputUrl.startsWith("...")) {
                return decodedString;
            }
            else {
                var result = inputUrl.substring(0, inputUrl.toLowerCase().indexOf("returnurl=") + 10) + decodedString;
                return result;
            }
        };
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
                returnUrl = this.decodeGzipUrl(returnUrl);
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
            url = this.decodeGzipUrl(url);
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i");
            var results = regex.exec(url);
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
        Url.prototype.getBaseThemeUrl = function () {
            if (document.URL.startsWith("http://localhost"))
                return '';
            var domain = window.location.hostname;
            if (domain.startsWith("hub.")) {
                domain = domain.substring(4);
            }
            return "https://" + domain + "/hub";
        };
        ;
        Url.prototype.ofContent = function (relativeUrl) {
            var base = this.getBaseThemeUrl();
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
            var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");
            if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
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
                        var documentUrl = document.URL;
                        var newUrl = trigger.attr("data-addressbar") || url;
                        var title = $(response).find("#page_meta_title").val();
                        if (title == undefined || title == null)
                            title = $("#page_meta_title").val();
                        var childaddress = document.URL.substring(documentUrl.indexOf("=") + 1);
                        var childaddresswithouthttp = document.URL.substring(documentUrl.indexOf("=") + 1).replace("https://", "").replace("http://", "");
                        var firstindex = childaddresswithouthttp.indexOf("/");
                        var secondindex = childaddresswithouthttp.indexOf("/", firstindex + 1);
                        var servicename = childaddresswithouthttp.substring(firstindex + 1, secondindex);
                        var extractedaddress = childaddress.replace("://hub", "://" + servicename).replace("/" + servicename + "/", "/");
                        if (newUrl.toLowerCase().contains(extractedaddress.substring(0, extractedaddress.indexOf("?")).toLowerCase())) {
                            var modifiedaddress = newUrl.substring(0, newUrl.indexOf("://") + 3) + newUrl.replace("://" + servicename, "://hub").replace("https://", "").replace("http://", "").replace("/", "/" + servicename + "/");
                            var newaddress = document.URL.substring(0, documentUrl.indexOf("=") + 1) + modifiedaddress;
                            window.history.pushState(null, title, newaddress);
                        }
                    }
                    else if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory && !window.isModal()) {
                            var title = $(response).find("#page_meta_title").val();
                            if (title == undefined || title == null)
                                title = $("#page_meta_title").val();
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
            if (document.URL.contains("?$")) {
                if (document.URL.contains("_modal="))
                    currentPath = document.URL.substring(0, document.URL.indexOf("_modal=") - 1);
                if (currentPath.contains("_iframe=")) {
                    currentPath = currentPath.substring(0, document.URL.indexOf("_iframe=") - 1);
                }
            }
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
            var addressurl = document.URL;
            if (addressurl != null && addressurl.contains("?$")) {
                modalUrl = this.url.addQuery(addressurl, "_modal", encodeURIComponent(url));
                if (iframe) {
                    modalUrl = this.url.addQuery(addressurl, "_iframe", "true");
                }
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
            var modalCustomClasses = "";
            if (options) {
                if (options.position) {
                    modalDialogStyle += "margin:0;";
                    if (options.position === "right" || options.position === "left") {
                        modalDialogStyle += "float:".concat(options.position, ";");
                    }
                }
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + "; max-width: none;";
                }
                else {
                    if (options.position) {
                        if (options.position === "right" || options.position === "left") {
                            modalDialogStyle += "width:30%; max-width: none;";
                        }
                        else if (options.position === "top" || options.position === "bottom") {
                            modalDialogStyle += "width:100%; max-width: 100%;";
                        }
                    }
                }
                if (options.height) {
                    if (options.position && options.position === "bottom") {
                        modalDialogStyle += "top:".concat(100 - parseInt(options.height.replace('%', ''), 10), ";height:").concat(options.height, ";");
                    }
                    else {
                        modalDialogStyle += "height:" + options.height + ";";
                    }
                }
                else if (options.position) {
                    if (options.position === "top") {
                        modalDialogStyle += "height:30%;";
                    }
                    else if (options.position === "bottom") {
                        modalDialogStyle += "top:70%;height:30%;";
                    }
                }
                if (options.customClasses) {
                    modalCustomClasses += options.customClasses;
                }
            }
            return ("<div class='modal ".concat(modalCustomClasses, "' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'                     aria-hidden='true'>                     <div class='modal-dialog' style='").concat(modalDialogStyle, "'>                     <div class='modal-content' >                     <div class='modal-header'>                     <button type='button' class='close' data-dismiss='modal' aria-label='Close'>                     <i class='fa fa-times-circle'></i>                     </button>                     </div>                     <div class='modal-body'>                     <main></main>                     </div>                     </div></div></div>"));
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
                $("body > #".concat(id, ".tooltip")).tooltip("hide");
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
            this.showWaitingBar = function () {
                var body = $("body");
                var waitingBar = $("<div id=\"waiting-bar\" style=\"position:fixed; \n                                                            top:0; \n                                                            left:0;\n                                                            width:100vw;\n                                                            height:100vh; \n                                                            background-color: rgba(0,0,0,0.4);\n                                                            z-index:100;\n                                                            overflow: auto; \n                                                            display:flex; \n                                                            justify-content:center; \n                                                            align-items:center;\">")
                    .append($("<div style=\"width:300px; height:30px;\">")
                    .append($("<div class=\"progress\" style=\"height: 100%;\">")
                    .append($("<div class=\"progress-bar progress-bar-striped progress-bar-animated\"\n                                        role=\"progressbar\" \n                                        aria-valuenow=\"100\" \n                                        aria-valuemin=\"0\" \n                                        aria-valuemax=\"100\" \n                                        style=\"width: 100%;\n                                              animation: 1s linear infinite progress-bar-stripes;\">"))));
                body.append(waitingBar);
            };
            this.removeWaitingBar = function () {
                var waitingBar = $("#waiting-bar");
                if (waitingBar.length > 0) {
                    waitingBar.remove();
                }
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
            if (containerModule.is("[waiting-bar]")) {
                this.showWaitingBar();
            }
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
            if (actionUrl != undefined && actionUrl != null && actionUrl.toLowerCase().contains("returnurl=")) {
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
                success: function (result) { $(".tooltip").remove(); _this.waiting.hide(); _this.removeWaitingBar(); _this.responseProcessor.processAjaxResponse(result, containerModule, trigger, null, null, null); },
                error: this.onAjaxResponseError,
                statusCode: {
                    401: function (data) {
                        _this.url.onAuthenticationFailed();
                    }
                },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse = false;
                    _this.removeWaitingBar();
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
// <div style="position:fixed; top:0; left:0;width:100vw;height:100vh; rgba(0,0,0,0.4);z-index:100;overflow: auto; display:flex; justify-content:center; align-items:center">
//     <div style="width:300px; height:30px; background-color:white; opacity:1">
//         <div class="progress" style="height: 100%;">
//             <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%"></div>
//         </div>
//     </div>
// </div>
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
define("olive/components/sorting", ["require", "exports", "jquery-sortable", "jquery-ui-touch-punch"], function (require, exports) {
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
                            dropDownList += "<a class=\"dropdown-item\" href=\"#\" formaction=\"".concat(urlAddress[0], "\" ").concat(urlAddress[1], ">").concat(val, "</a>");
                        }
                        else
                            dropDownList += "<a class=\"dropdown-item\" href=\"".concat(urlAddress[0], "\" ").concat(urlAddress[1], ">").concat(val, "</a>");
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
            var chevorchild = this.input.parent().children().first();
            chevorchild.on("click", function () { return _this.input.trigger("focus.select"); });
            chevorchild.on("click", function () { return _this.input.trigger("click"); });
            var chevr = $("fa-chevron-down");
            chevr.on("click", function () { return _this.input.trigger("focus.select"); });
            chevr.on("click", function () { return _this.input.trigger("click"); });
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
            if (this.isTyping === false) {
                sender.result = result;
                if (result !== null && result !== undefined && typeof (result) === typeof ([])) {
                    sender.state = AjaxState.success;
                    // Results from GlobalSearch MS have the GroupTitle in their description field separated with $$$
                    var resultWithType = result.map(function (x) {
                        if (x.Description === null || x.Description.indexOf("$$$") < 0) {
                            return x;
                        }
                        var descArray = x.Description.split("$$$");
                        var groupTitle = descArray.shift();
                        x.GroupTitle = groupTitle;
                        x.Description = descArray.join("");
                        return x;
                    });
                    var groupedByResult = this.groupBy(resultWithType, 'GroupTitle');
                    for (var item in groupedByResult) {
                        var searchItem = this.createSearchItems(sender, context, groupedByResult[item]);
                        context.searchHolder.append(searchItem);
                        if (context.beginSearchStarted && result.length > 0) {
                            context.beginSearchStarted = false;
                            context.resultPanel.empty();
                            context.resultPanel.append(context.searchHolder);
                        }
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
            var groupTitle = ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ?
                items[0].GroupTitle : sender.url.split(".")[0]
                .replace("https://", "")
                .replace("http://", "")
                .replace("'", "")
                .replace("\"", "")
                .toUpperCase();
            var searchItem = $("<div class='search-item'>");
            var searchTitleHolder = $("<div class='search-title'>");
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                searchItem.css("color", items[0].Colour);
                //searchTitleHolder.css("color", items[0].Colour);
            }
            var searhTitle = searchTitleHolder.append($("<i>").attr("class", sender.icon)).append(groupTitle);
            // we may need to use the search title to implement show more.
            // but we may only need to add li (show more) at the end of list and after it is clicked,
            // it makes all hidden items visible
            searchItem.append(searhTitle);
            var childrenItems = $("<ul>");
            var resultItemsCount = 100;
            for (var i = 0; i < items.length && i < resultItemsCount; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            if (childrenItems.children('li').length > 5) {
                var removeExceededItems_1 = function () {
                    childrenItems.children('li').each(function (index, element) {
                        if (index < 5) {
                            return;
                        }
                        $(element).css('display', 'none');
                    });
                };
                removeExceededItems_1();
                var showMoreClass_1 = 'show-more';
                var showMoreItem_1 = $("<li class='show-toggle'>").html("Show more");
                showMoreItem_1.addClass(showMoreClass_1);
                childrenItems.append(showMoreItem_1);
                showMoreItem_1.click(function () {
                    if (showMoreItem_1.hasClass(showMoreClass_1)) {
                        showMoreItem_1.siblings().css("display", "list-item");
                        showMoreItem_1.toggleClass(showMoreClass_1);
                        showMoreItem_1.html("Show less");
                    }
                    else {
                        removeExceededItems_1();
                        showMoreItem_1.toggleClass(showMoreClass_1);
                        showMoreItem_1.css("display", "list-item");
                        showMoreItem_1.html("Show more");
                    }
                });
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
                .append($("<div class='result-item'>")
                .append($("<p class='icon'>")
                .append($("<a name = 'Photo' class='profile-photo' href='".concat(item.Url, "'>"))
                .append((item.IconUrl === null || item.IconUrl === undefined) ? $("<div class='icon'>") : this.showIcon(item))))
                .append($("<div class='result-item-content'>")
                .append($("<p class='type'>")
                .append($("<a href='".concat(item.Url, "' ").concat(attr, ">")).html(this.boldSearchAll(item.GroupTitle, context.searchedText))))
                .append($("<p class='title'>")
                .append($("<a href='".concat(item.Url, "' ").concat(attr, ">")).html(this.boldSearchAll(item.Title, context.searchedText))))
                .append($("<p class='body'>")
                .append($("<a href='".concat(item.Url, "' ").concat(attr, ">")).html(this.boldSearchAll(item.Description, context.searchedText))))));
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
                return $("<span class='icon-background' style = 'background-color: ".concat(item.Colour, "'>"))
                    .append($("<span class='".concat(item.IconUrl, "' >")));
            }
            else {
                return $("<img src='".concat(item.IconUrl, "' />"));
            }
        };
        GlobalSearch.prototype.groupBy = function (array, key) {
            return array.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
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
            var minimumDate = this.input.attr("min-date") || "null";
            var maximumDate = this.input.attr("max-date") || "null";
            if (minimumDate == undefined || minimumDate == null || minimumDate == "null") {
                minimumDate = "01/01/1900";
            }
            if (maximumDate == undefined || maximumDate == null || maximumDate == "null") {
                maximumDate = "01/01/2090";
            }
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
                    stepping: stepping,
                    minDate: minimumDate,
                    maxDate: maximumDate,
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
                url: this.url.makeAbsolute(undefined, "/temp-file/".concat(id)),
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
                var key = "".concat(id, "/").concat(file.name);
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
            var url = "".concat(this.bucketUrl).concat(id, "/").concat(filename);
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
            var inputsibling = element.parent().prev('[type=text]');
            if (inputsibling != undefined && inputsibling != null && inputsibling.length > 0)
                inputsibling['popover']({ trigger: 'focus', content: message, html: true, placement: 'top' });
        }
        UserHelp.enable = function (selector) { selector.each(function (i, e) { return new UserHelp($(e)); }); };
        return UserHelp;
    }());
    exports.default = UserHelp;
});
define("olive/plugins/multiSelect", ["require", "exports", "bootstrap-select"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiSelectFactory = void 0;
    var MultiSelectFactory = /** @class */ (function () {
        function MultiSelectFactory(modalHelper) {
            this.modalHelper = modalHelper;
        }
        MultiSelectFactory.prototype.enable = function (selector) {
            var _this = this;
            selector.each(function (i, e) { return new MultiSelect($(e), _this.modalHelper).show(); });
        };
        return MultiSelectFactory;
    }());
    exports.MultiSelectFactory = MultiSelectFactory;
    var MultiSelect = /** @class */ (function () {
        //https://developer.snapappointments.com/bootstrap-select/
        function MultiSelect(selectControl, modalHelper) {
            this.selectControl = selectControl;
            this.modalHelper = modalHelper;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
        }
        MultiSelect.prototype.show = function () {
            var maxOptions = this.selectControl.attr("maxOptions") || false;
            var actionsBox = true;
            var attrib = this.selectControl.attr("actionsBox");
            if (attrib != undefined && attrib != null && attrib == "false") {
                actionsBox = false;
            }
            var container = this.selectControl.attr("container") || false;
            var deselectAllText = this.selectControl.attr("deselectAllText") || "Deselect All";
            var dropdownAlignRight = this.selectControl.attr("dropdownAlignRight") || false;
            var dropupAuto = true;
            var attrib = this.selectControl.attr("dropupAuto");
            if (attrib != undefined && attrib != null && attrib == "false") {
                dropupAuto = false;
            }
            var header = this.selectControl.attr("header") || false;
            var hideDisabled = this.selectControl.attr("hideDisabled") || false;
            var liveSearch = true;
            var attrib = this.selectControl.attr("liveSearch");
            if (attrib != undefined && attrib != null && attrib == "false") {
                liveSearch = false;
            }
            var liveSearchNormalize = this.selectControl.attr("liveSearchNormalize") || false;
            var liveSearchPlaceholder = this.selectControl.attr("liveSearchPlaceholder") || null;
            var liveSearchStyle = this.selectControl.attr("liveSearchStyle") || "contains";
            var maxOptionsText = this.selectControl.attr("maxOptionsText") || "Cannot select more items";
            var mobile = this.selectControl.attr("mobile") || false;
            var multipleSeparator = this.selectControl.attr("multipleSeparator") || ", ";
            var noneSelectedText = this.selectControl.attr("noneSelectedText") || "Nothing selected";
            var noneResultsText = this.selectControl.attr("noneResultsText") || "No results matched";
            var selectAllText = this.selectControl.attr("selectAllText") || "Select All";
            var selectedTextFormat = "count > 1";
            var attrib = this.selectControl.attr("selectedTextFormat");
            if (attrib != undefined && attrib != null) {
                selectedTextFormat = attrib;
            }
            var selectOnTab = this.selectControl.attr("selectOnTab") || false;
            var showContent = true;
            var attrib = this.selectControl.attr("showContent");
            if (attrib != undefined && attrib != null && attrib == "false") {
                showContent = false;
            }
            var showIcon = true;
            var attrib = this.selectControl.attr("showIcon");
            if (attrib != undefined && attrib != null && attrib == "false") {
                showIcon = false;
            }
            var showSubtext = this.selectControl.attr("showSubtext") || false;
            var size = this.selectControl.attr("size") || "auto";
            var styleBase = this.selectControl.attr("styleBase") || "btn";
            var title = this.selectControl.attr("title") || null;
            var virtualScroll = this.selectControl.attr("virtualScroll") || false;
            var width = this.selectControl.attr("width") || false;
            var windowPadding = this.selectControl.attr("windowPadding") || 0;
            var sanitize = true;
            var attrib = this.selectControl.attr("sanitize");
            if (attrib != undefined && attrib != null && attrib == "false") {
                sanitize = false;
            }
            var options = {
                maxOptions: maxOptions,
                actionsBox: actionsBox,
                container: container,
                deselectAllText: deselectAllText,
                dropdownAlignRight: dropdownAlignRight,
                dropupAuto: dropupAuto,
                header: header,
                hideDisabled: hideDisabled,
                liveSearch: liveSearch,
                liveSearchNormalize: liveSearchNormalize,
                liveSearchPlaceholder: liveSearchPlaceholder,
                liveSearchStyle: liveSearchStyle,
                maxOptionsText: maxOptionsText,
                mobile: mobile,
                multipleSeparator: multipleSeparator,
                noneSelectedText: noneSelectedText,
                noneResultsText: noneResultsText,
                selectAllText: selectAllText,
                selectedTextFormat: selectedTextFormat,
                selectOnTab: selectOnTab,
                showContent: showContent,
                showIcon: showIcon,
                showSubtext: showSubtext,
                size: size,
                styleBase: styleBase,
                title: title,
                virtualScroll: virtualScroll,
                width: width,
                windowPadding: windowPadding,
                sanitize: sanitize
            };
            this.selectControl.selectpicker(options);
            this.MoveActionButtons();
        };
        MultiSelect.prototype.MoveActionButtons = function () {
            //var actionbuttons = $(".bs-actionsbox");
            //if (actionbuttons != undefined && actionbuttons != null)
            //    actionbuttons.parent().prepend($(".bs-actionsbox"));
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
            this.factory = function () { throw new Error("factory is not provided for type '".concat(_this.key, "'.")); };
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
                throw new Error("No service registered for '".concat(key, "'."));
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
                throw new Error("A service with the same key (".concat(key, ") is already added"));
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
        MultiSelectFactory: "MultiSelectFactory"
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
            if (services.tryAddSingleton(services_1.default.MultiSelectFactory, function (modalHelper) { return new multiSelect_1.MultiSelectFactory(modalHelper); }, out)) {
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
            //this.getService<MultiSelect>(Services.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
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
            this.getService(services_1.default.MultiSelectFactory).enable($("[data-control=collapsible-checkboxes]"));
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
            returnUrl = url.decodeGzipUrl(returnUrl);
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