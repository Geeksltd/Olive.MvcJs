define("olive/config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Config {
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
    exports.default = Config;
});
define("olive/components/crossDomainEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CrossDomainEvent {
        static handle(command, handler) {
            window.addEventListener("message", (e) => {
                try {
                    let info = null;
                    if (e.data && typeof e.data === "string" && e.data.startsWith("{")) {
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
        }
        static raise(window, command, arg = null) {
            const json = JSON.stringify({
                command,
                arg,
            });
            window.postMessage(json, "*");
        }
    }
    exports.default = CrossDomainEvent;
});
define("olive/components/liteEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LiteEvent {
        constructor() {
            this.handlers = [];
        }
        handle(handler) {
            this.handlers.push(handler);
        }
        remove(handler) {
            this.handlers = this.handlers.filter(h => h !== handler);
        }
        raise(data) {
            this.handlers.slice(0).forEach(h => h(data));
        }
    }
    exports.default = LiteEvent;
});
define("olive/mvc/responseProcessor", ["require", "exports", "olive/components/liteEvent"], function (require, exports, liteEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ResponseProcessor {
        constructor() {
            this.dynamicallyLoadedScriptFiles = [];
            this.subformChanged = new liteEvent_1.default();
            this.viewChanged = new liteEvent_1.default();
            this.processCompleted = new liteEvent_1.default();
            this.nothingFoundToProcess = new liteEvent_1.default();
        }
        processAjaxResponse(response, containerModule, trigger, args, ajaxTarget, ajaxhref) {
            let asElement = $(response);
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
                let subFormName = trigger.attr("data-add-subform");
                let container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
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
        }
        onNothingFoundToProcess(response, trigger) {
            this.nothingFoundToProcess.raise({ response: response, trigger: trigger });
        }
        onSubformChanged(response, trigger) {
            this.subformChanged.raise({ response: response, trigger: trigger });
        }
        onViewChanged(container, trigger, isNewPage = false) {
            this.viewChanged.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
        }
        navigate(element, trigger, args) {
            const referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
            const newCss = this.getNewCss(element);
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
                const tags = newCss.map(item => $('<link rel="stylesheet" type="text/css" />').attr("href", item));
                tags.forEach(e => {
                    e.on('load', () => _processWithTheContent($this, newCss.length));
                    $("head").append(e);
                });
                //tags[0].on('load', () => this.processWithTheContent(trigger, element, args, referencedScripts));
                //$("head").append(tags);
            }
            else
                this.processWithTheContent(trigger, element, args, referencedScripts);
        }
        navigatebyAjaxTarget(element, ajaxTarget) {
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
            let oldMain = $("main[name='" + ajaxTarget + "']");
            if (oldMain.length === 0) {
                console.error("There is no <main> object with the name of '" + ajaxTarget + "'.");
                return;
            }
            element.attr("name", ajaxTarget);
            let tooltips = $('body > .tooltip');
            tooltips.each((index, elem) => {
                if ($('[aria-discribedby=' + elem.id + ']'))
                    elem.remove();
            });
            oldMain.replaceWith(element);
            //this.onViewChanged(element, oldMain, true);
            //this.onProcessCompleted();
        }
        getNewCss(element) {
            let referencedCss = this.getCss(element);
            let currentCss = this.getCss($("body"));
            return referencedCss.filter(x => currentCss.indexOf(x) === -1);
        }
        getCss(parent) {
            let result = new Array();
            parent.find("link[rel=stylesheet]").each((i, s) => result.push($(s).attr("href")));
            return result;
        }
        processWithTheContent(trigger, newMain, args, referencedScripts) {
            let width = $(window).width();
            let oldMain = trigger.closest("main");
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
            let tooltips = $('body > .tooltip');
            tooltips.each((index, elem) => {
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
                setTimeout(() => {
                    oldMain.remove();
                    newMain.removeClass("w3-animate-left").removeClass("w3-animate-right");
                    this.updateUrl(referencedScripts, newMain, trigger);
                }, 400);
            }
            else {
                oldMain.replaceWith(newMain);
                this.updateUrl(referencedScripts, newMain, trigger);
            }
        }
        updateUrl(referencedScripts, element, trigger) {
            if (referencedScripts.length) {
                let expectedScripts = referencedScripts.length;
                let loadedScripts = 0;
                referencedScripts.each((_, item) => {
                    let url = '' + item;
                    if (this.dynamicallyLoadedScriptFiles.indexOf(url) > -1) {
                        loadedScripts++;
                        if (loadedScripts == expectedScripts)
                            this.onViewChanged(element, trigger, true);
                    }
                    else {
                        this.dynamicallyLoadedScriptFiles.push(url);
                        $.getScript(url, () => {
                            loadedScripts++;
                            if (loadedScripts == expectedScripts)
                                this.onViewChanged(element, trigger, true);
                        });
                    }
                });
            }
            else
                this.onViewChanged(element, trigger, true);
            let modalTitleAttribute = $(".modal-dialog #page_meta_title").attr("value");
            let pageTitleAttribute = $("#page_meta_title").attr("value");
            if (modalTitleAttribute !== undefined || modalTitleAttribute !== undefined)
                document.title = modalTitleAttribute !== null && modalTitleAttribute !== void 0 ? modalTitleAttribute : pageTitleAttribute;
            this.onProcessCompleted();
        }
        onProcessCompleted() {
            this.processCompleted.raise({});
        }
    }
    exports.default = ResponseProcessor;
});
define("olive/components/url", ["require", "exports", "pako/dist/pako"], function (require, exports, pako) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Url {
        constructor() {
            this.effectiveUrlProvider = (u, t) => u;
            this.onAuthenticationFailed = this.goToLoginPage;
            this.baseContentUrl = window["BaseThemeUrl"] || '/';
        }
        decodeGzipUrl(inputUrl) {
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
            var binaryArray = Uint8Array.from(atob(encodedUrl), c => c.charCodeAt(0));
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
        }
        encodeGzipUrl(inputValue) {
            if (inputValue === undefined || inputValue === null)
                return "";
            var compressed_uint8array = pako.gzip(inputValue);
            var encodedUrl = btoa(String.fromCharCode.apply(null, compressed_uint8array));
            encodedUrl = encodedUrl.replace(/\+/g, "~").replace(/\//g, "_").replace(/\=/g, "-");
            return "..." + encodedUrl;
        }
        makeAbsolute(baseUrl, relativeUrl) {
            baseUrl = baseUrl || window.location.origin;
            relativeUrl = relativeUrl || '';
            if (relativeUrl.indexOf('/') != 0)
                relativeUrl = '/' + relativeUrl;
            if (baseUrl.charAt(baseUrl.length - 1) == '/')
                baseUrl = baseUrl.substring(0, baseUrl.length - 1);
            return baseUrl + relativeUrl;
        }
        makeRelative(url) {
            if (this.isAbsolute(url))
                return url.split("/").splice(3).join("/");
            else
                return url;
        }
        isAbsolute(url) {
            if (!url)
                return false;
            url = url.toLowerCase();
            return url.indexOf("http://") === 0 || url.indexOf("https://") === 0;
        }
        current() { return window.location.href; }
        goBack(target) {
            if (this.current().indexOf(this.baseContentUrl + "/##") === 0)
                history.back();
            else {
                let returnUrl = this.getQuery("ReturnUrl");
                returnUrl = this.decodeGzipUrl(returnUrl);
                if (returnUrl)
                    window.location.href = returnUrl;
                else
                    history.back();
            }
        }
        updateQuery(uri, key, value) {
            if (uri == null)
                uri = window.location.href;
            let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            let separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re))
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            else
                return uri + separator + key + "=" + value;
        }
        removeQuery(url, parameter) {
            //prefer to use l.search if you have a location/link object
            let urlParts = url.split('?');
            if (urlParts.length >= 2) {
                let prefix = encodeURIComponent(parameter).toLowerCase() + '=';
                let parts = urlParts[1].split(/[&;]/g);
                //reverse iteration as may be destructive
                for (let i = parts.length; i-- > 0;) {
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
        }
        getQuery(name, url = null) {
            if (url)
                url = this.fullQueryString(url);
            else
                url = location.search;
            url = this.decodeGzipUrl(url);
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            let regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i");
            var results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        getModalQuery(name) {
            return this.getQuery(name, this.getQuery("_modal"));
        }
        goToUrlAfterLogin(url) {
            window.location.href = "/login?returnUrl=/" + encodeURIComponent(this.makeRelative(url).trimStart("/"));
        }
        goToLoginPage() {
            let query = this.current().split("/").splice(3).join("/");
            window.location.href = "/login?returnUrl=/" + query.trimStart("/");
        }
        fullQueryString(url) {
            if (url == undefined || url == null)
                url = this.current();
            if (url.indexOf("?") == -1)
                return '';
            return url.substring(url.indexOf("?"));
        }
        addQuery(url, key, value) { return url + (url.indexOf("?") == -1 ? "?" : "&") + key + "=" + value; }
        removeEmptyQueries(url) {
            let items = this.fullQueryString(url).trimStart('?').split('&');
            let result = '';
            for (let i in items) {
                let key = items[i].split('=')[0];
                let val = items[i].split('=')[1];
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
        }
        getBaseThemeUrl() {
            if (document.URL.startsWith("http://localhost"))
                return '';
            let domain = window.location.hostname;
            if (domain.startsWith("hub.")) {
                domain = domain.substring(4);
            }
            return "https://" + domain + "/hub";
        }
        ;
        ofContent(relativeUrl) {
            let base = this.getBaseThemeUrl();
            while (base.length > 0 && base[base.length - 1] === '/')
                base = base.substring(0, base.length - 1);
            while (relativeUrl.length > 0 && relativeUrl[0] === '/')
                relativeUrl = relativeUrl.substring(1);
            return base + '/' + relativeUrl;
        }
    }
    exports.default = Url;
});
define("olive/components/waiting", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Waiting {
        constructor(url) {
            this.url = url;
        }
        show(blockScreen = false, validate = true) {
            if (validate) {
                for (let i = 0; i < document.forms.length; i++)
                    if (!$(document.forms[i]).valid())
                        return;
            }
            let screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                $("<div class='cover' />")
                    .width(Math.max($(document).width(), $(window).width()))
                    .height(Math.max($(document).height(), $(window).height()))
                    .appendTo(screen);
            }
            var loadingContent = '';
            var customLoading = $("#loading");
            if (customLoading.length) {
                loadingContent = customLoading.html();
            }
            else {
                var imageUrl = this.url.ofContent('/img/loading.gif');
                loadingContent = "<img src='" + imageUrl + "'/>";
            }
            $("<div class='wait-container'><div class='wait-box'>" + loadingContent + "</div>")
                .appendTo(screen)
                .show();
        }
        hide() {
            $(".wait-screen").remove();
        }
    }
    exports.default = Waiting;
});
define("olive/mvc/ajaxRedirect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AjaxRedirect {
        // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
        // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;
        constructor(url, responseProcessor, waiting) {
            this.url = url;
            this.responseProcessor = responseProcessor;
            this.waiting = waiting;
            this.requestCounter = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
        }
        enableRedirect(selector) {
            selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
        }
        onRedirected(trigger, title, url) {
            // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
            // we need to edit a query string parameter as _{main tag name without $}={url pathname}
            const mainTag = trigger.is("main[name^='$']") ? trigger : trigger.closest("main[name^='$']");
            if (mainTag && mainTag.length) {
                url = this.url.updateQuery(this.url.current(), mainTag.attr("name").replace("$", "_"), this.url.encodeGzipUrl(url));
                history.pushState({}, title, url);
                return;
            }
            history.pushState({}, title, url);
        }
        onRedirectionFailed(trigger, url, response) {
            if (response.status === 401) {
                this.url.goToUrlAfterLogin(this.url.current());
            }
            else if (confirm("Request failed. Do you want to see the error details?")) {
                open(url, "_blank");
            }
        }
        redirect(event) {
            if (event.ctrlKey || event.button === 1) {
                return true;
            }
            const link = $(event.currentTarget);
            let url = link.attr("href");
            const ajaxTarget = link.attr("ajax-target");
            const ajaxhref = link.attr("href");
            const ajaxUrl = link.attr("ajax-href");
            if (ajaxUrl != null && ajaxUrl != undefined)
                url = ajaxUrl;
            this.go(url, link, false, false, true, undefined, ajaxTarget, ajaxhref);
            return false;
        }
        go(inputUrl, trigger = null, isBack = false, keepScroll = false, addToHistory = true, onComplete, ajaxTarget, ajaxhref) {
            if (!trigger) {
                trigger = $(window);
            }
            var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");
            if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
                return;
            }
            let url = this.url.effectiveUrlProvider(inputUrl, trigger);
            if (url.indexOf(this.url.baseContentUrl + "/##") === 0) {
                url = url.substring(this.url.baseContentUrl.length).substring(3);
            }
            this.isAjaxRedirecting = true;
            // this.serverInvoker.isAwaitingAjaxResponse = true;
            const requestCounter = ++this.requestCounter;
            // if (window.stop) {
            //     window.stop();
            // } else if (document.execCommand !== undefined) {
            //     document.execCommand("Stop", false);
            // }
            let scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.waiting.show(false, false);
            $.ajax({
                url,
                type: "GET",
                xhrFields: { withCredentials: true },
                success: (response) => {
                    if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                        const documentUrl = document.URL;
                        const newUrl = trigger.attr("data-addressbar") || url;
                        var title = $(response).find("#page_meta_title").val();
                        if (title == undefined || title == null)
                            title = $("#page_meta_title").val();
                        const childaddress = document.URL.substring(documentUrl.indexOf("=") + 1);
                        const childaddresswithouthttp = document.URL.substring(documentUrl.indexOf("=") + 1).replace("https://", "").replace("http://", "");
                        const firstindex = childaddresswithouthttp.indexOf("/");
                        const secondindex = childaddresswithouthttp.indexOf("/", firstindex + 1);
                        const servicename = childaddresswithouthttp.substring(firstindex + 1, secondindex);
                        const extractedaddress = childaddress.replace("://hub", "://" + servicename).replace("/" + servicename + "/", "/");
                        if (addToHistory && newUrl.toLowerCase().contains(extractedaddress.substring(0, extractedaddress.indexOf("?")).toLowerCase())) {
                            const modifiedaddress = newUrl.substring(0, newUrl.indexOf("://") + 3) + newUrl.replace("://" + servicename.toLowerCase(), "://hub").replace("https://", "").replace("http://", "").replace("/", "/" + servicename + "/");
                            const newaddress = document.URL.substring(0, documentUrl.indexOf("=") + 1) + modifiedaddress;
                            this.onRedirected(trigger, title, newaddress);
                        }
                    }
                    else if (!isBack) {
                        this.ajaxChangedUrl++;
                        if (addToHistory && !window.isModal()) {
                            var title = $(response).find("#page_meta_title").val();
                            if (title == undefined || title == null)
                                title = $("#page_meta_title").val();
                            let addressBar = trigger.attr("data-addressbar") || url;
                            try {
                                this.onRedirected(trigger, title, addressBar);
                            }
                            catch (error) {
                                addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
                                this.onRedirected(trigger, title, addressBar);
                            }
                        }
                    }
                    // this.serverInvoker.isAwaitingAjaxResponse = false;
                    this.isAjaxRedirecting = false;
                    this.responseProcessor.processAjaxResponse(response, null, trigger, isBack ? "back" : null, ajaxTarget, ajaxhref);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
                    if (onComplete) {
                        onComplete(true);
                    }
                },
                error: (response) => {
                    if (onComplete) {
                        onComplete(false);
                    }
                    if (this.requestCounter === requestCounter) {
                        this.onRedirectionFailed(trigger, url, response);
                    }
                },
                complete: (response) => this.waiting.hide(),
            });
            return false;
        }
    }
    exports.default = AjaxRedirect;
});
define("olive/components/alert", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Alert {
        enableAlert() {
            let w = window;
            w.alert = (text, callback) => this.alert(text, null, callback);
        }
        alert(text, style, callback) {
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
        }
        confirm(text, style, callback) {
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
        }
        alertUnobtrusively(message, style) {
            alertify.log(message, style);
        }
    }
    exports.default = Alert;
});
define("olive/plugins/select", ["require", "exports", "bootstrap-select"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Select {
        //https://developer.snapappointments.com/bootstrap-select/
        enableEnhance(selector) { selector.each((i, e) => this.enhance($(e))); }
        enhance(selectControl) {
            selectControl.selectpicker();
        }
        replaceSource(controlId, items) {
            let $control = $('#' + controlId);
            if ($control.is("select")) {
                $control.empty();
                for (let i = 0; i < items.length; i++) {
                    $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
                }
            }
            else {
                console.log("Unable to replace list items");
            }
        }
    }
    exports.default = Select;
});
define("olive/components/modal", ["require", "exports", "olive/components/crossDomainEvent"], function (require, exports, crossDomainEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModalHelper = void 0;
    class ModalHelper {
        constructor(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.current = null;
            this.currentModal = null;
            this.isAjaxModal = false;
            this.isClosingModal = false;
        }
        enableLink(selector) {
            selector.off("click.open-modal").on("click.open-modal", (e) => {
                this.close();
                if ($(e.currentTarget).attr("data-mode") === "iframe") {
                    this.openiFrame(e);
                }
                else {
                    setTimeout(() => this.open(e), 0);
                }
                return false;
            });
        }
        initialize() {
            crossDomainEvent_1.default.handle("set-iframe-height", (x) => this.setIFrameHeight(x));
            crossDomainEvent_1.default.handle("close-modal", (x) => this.close());
            this.responseProcessor.processCompleted.handle(() => this.tryOpenFromUrl());
            window.isModal = () => {
                try {
                    if (this.isAjaxModal) {
                        return true;
                    }
                    return $("#myModal").length > 0;
                    // return window.self !== window.parent;
                }
                catch (e) {
                    return true;
                }
            };
        }
        closeMe() {
            if (!this.isAjaxModal) {
                crossDomainEvent_1.default.raise(parent, "close-modal");
            }
            this.close();
            $("body > .tooltip").each((index, elem) => {
                if ($("[aria-discribedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            return true;
        }
        close() {
            this.isClosingModal = true;
            let hasModalContent = this.current;
            if (this.current) {
                if (this.currentModal.shouldKeepScroll()) {
                    $(window).scrollTop(this.currentModal.scrollPosition);
                }
                const onClosingEvent = new CustomEvent("onClosingEvent");
                this.current[0].dispatchEvent(onClosingEvent);
                this.current.modal("hide");
                if (this.currentModal.onClose == null && this.currentModal.onClose == undefined) {
                    this.current.remove();
                    this.current = null;
                    this.currentModal = null;
                }
            }
            $("body > .tooltip").each((index, elem) => {
                if ($("[aria-describedby=" + elem.id + "]")) {
                    elem.remove();
                }
            });
            this.isClosingModal = false;
            this.isAjaxModal = false;
            // remove modal query string
            let currentPath = this.url.removeQuery(this.url.current(), "_modal");
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
        }
        setIFrameHeight(arg) {
            try {
                const iframe = $("iframe").filter((_, f) => f.src === arg.url);
                if (iframe.attr("data-has-explicit-height") === "true") {
                    return;
                }
                iframe.height(arg.height + 30); // we have 30px padding
            }
            catch (error) {
                console.error(error);
            }
        }
        enableEnsureHeight(selector) {
            selector.off("click.tab-toggle").on("click.tab-toggle", () => this.ensureHeight());
        }
        ensureHeight() {
            setTimeout(() => this.adjustHeight(), 1);
        }
        adjustHeight(overflow) {
            if (window.isModal()) {
                crossDomainEvent_1.default.raise(parent, "set-iframe-height", {
                    url: window.location.href,
                    height: document.body.scrollHeight + (overflow || 0),
                });
            }
        }
        expandToFitPicker(target) {
            const datepicker = $(target.currentTarget).siblings(".bootstrap-datetimepicker-widget");
            if (datepicker.length === 0) {
                this.adjustHeight();
                return;
            }
            const offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            const overflow = Math.max(offset, 0);
            this.adjustHeight(overflow);
        }
        ensureNonModal() {
            if (window.isModal()) {
                parent.window.location.href = location.href;
            }
        }
        tryOpenFromUrl() {
            if (this.url.getQuery("_modal") && $("#myModal").length === 0) {
                this.openWithUrl();
            }
        }
        changeUrl(url, iframe = false) {
            let currentPath = this.url.removeQuery(this.url.current(), "_modal");
            currentPath = this.url.removeQuery(currentPath, "_iframe");
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            if (this.url.isAbsolute(url)) {
                const pathArray = url.split("/").splice(3);
                url = pathArray.join("/");
            }
            let modalUrl = this.url.addQuery(currentPath, "_modal", encodeURIComponent(url));
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
        }
        isOrGoingToBeModal() {
            return window.isModal() || !!this.url.getQuery("_modal");
        }
        open(event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).open();
        }
        openiFrame(event, url, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, url, options).openiFrame();
        }
        openWithUrl() {
            // Prevent XSS
            let modalQuery = this.url.getQuery("_modal").toLowerCase();
            if (modalQuery.contains("javascript:")) {
                alert("Dangerous script detected!!! Request is now aborted!");
                return;
            }
            // Prevent Open Redirection
            if (modalQuery.indexOf("http://") === 0 || modalQuery.indexOf("https://") === 0) {
                let newHostName = new URL(modalQuery).hostname;
                let currentHostName = new URL(this.url.current()).hostname;
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
        }
    }
    exports.ModalHelper = ModalHelper;
    class Modal {
        constructor(urlService, ajaxRedirect, helper, event, targeturl, opt) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.isOpening = false;
            this.modalOptions = {};
            const target = event ? $(event.currentTarget) : null;
            this.opener = target;
            this.url = targeturl ? targeturl : target.attr("href");
            this.rawUrl = this.url;
            this.url = this.urlService.effectiveUrlProvider(this.url, target);
            const options = opt ? opt : (target ? target.attr("data-modal-options") : null);
            if (options) {
                this.modalOptions = JSON.safeParse(options);
            }
        }
        onComplete(success) {
        }
        onClose() {
            this.onClose = null;
            $(this.helper.current).modal('hide');
        }
        open(changeUrl = true) {
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
            this.ajaxRedirect.go(this.url, $(this.helper.current).find("main"), true, this.shouldKeepScroll(), changeUrl, (success) => {
                if (this.onComplete != null && this.onComplete != undefined)
                    this.onComplete(success);
                if (changeUrl && window.isModal()) {
                    this.helper.changeUrl(this.url);
                }
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hide.bs.modal", () => {
                if (this.onClose != null && this.onClose != undefined) {
                    this.onClose();
                    return false;
                }
                crossDomainEvent_1.default.raise(window.self, "close-modal");
                return true;
            });
        }
        openiFrame(changeUrl = true) {
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
            const frame = this.helper.current.find("iframe");
            const url = this.url;
            frame.attr("src", url).on("load", (e) => {
                this.isOpening = false;
                if (changeUrl) {
                    this.helper.changeUrl(url, true);
                }
                this.helper.current.find(".modal-body .text-center").remove();
            });
            $("body").append(this.helper.current);
            this.helper.current.modal("show");
            this.helper.current.on("hidden.bs.modal", () => {
                crossDomainEvent_1.default.raise(window.self, "close-modal");
            });
        }
        shouldKeepScroll() {
            if (this.modalOptions) {
                if (this.modalOptions.keepScroll) {
                    return this.modalOptions.keepScroll;
                }
            }
            return true;
        }
        getModalTemplateForAjax(options) {
            let modalDialogStyle = "";
            var modalCustomClasses = "";
            if (options) {
                if (options.position) {
                    modalDialogStyle += "margin:0;";
                    if (options.position === "right" || options.position === "left") {
                        modalDialogStyle += `float:${options.position};`;
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
                        modalDialogStyle += `top:${100 - parseInt(options.height.replace('%', ''), 10)};height:${options.height};`;
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
            return (`<div class='modal ${modalCustomClasses}' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
                     aria-hidden='true'>\
                     <div class='modal-dialog' style='${modalDialogStyle}'>\
                     <div class='modal-content' >\
                     <div class='modal-header'>\
                     <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                     <i class='fa fa-times-circle'></i>\
                     </button>\
                     </div>\
                     <div class='modal-body'>\
                     <main></main>\
                     </div>\
                     </div></div></div>`);
        }
        getModalTemplateForiFrame(options) {
            let modalDialogStyle = "";
            let iframeStyle = "width:100%; border:0;";
            let iframeAttributes = "";
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
        }
    }
    exports.default = Modal;
});
define("olive/components/mainTag", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainTagHelper = void 0;
    class MainTagHelper {
        constructor(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.data = {};
        }
        enableLink(selector) {
            selector.off("click").on("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.render(e);
                return false;
            });
        }
        initialize() {
            this.data = {};
            this.responseProcessor.processCompleted.handle((e) => {
                this.tryOpenFromUrl();
            });
        }
        tryOpenFromUrl() {
            var reserved = ["_modal", "_nav", "_returnUrl"];
            new URLSearchParams(window.location.search).forEach((value, key) => {
                if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                    this.openWithUrl(key.substring(1));
                }
            });
        }
        changeUrl(url, mainTagName) {
            let currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            let mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, this.url.encodeGzipUrl(url));
            history.pushState({}, "", mainTagUrl);
        }
        render(event, url) {
            const target = $(event.currentTarget);
            let mainTagUrl = url ? url : target.attr("href");
            let mainTagName = target.attr("target").replace("$", "");
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName, target).render();
        }
        openWithUrl(mainTagName) {
            let mainTagUrl = this.url.getQuery("_" + mainTagName);
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName, undefined).render(false);
        }
    }
    exports.MainTagHelper = MainTagHelper;
    class MainTag {
        constructor(urlService, ajaxRedirect, helper, baseUrl, mainTagName, trigger) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.mainTagName = mainTagName;
            this.trigger = trigger;
            baseUrl = this.urlService.decodeGzipUrl(baseUrl);
            if (this.isValidUrl(baseUrl)) {
                this.url = this.urlService.makeRelative(decodeURIComponent(baseUrl));
            }
            this.element = $("main[name='$" + this.mainTagName + "']");
        }
        onComplete(success) {
            this.helper.data[this.mainTagName].status = success ? "loaded" : "failed";
        }
        render(changeUrl = true) {
            if (!this.element || !this.element.length || !this.url) {
                return;
            }
            const urlData = this.helper.data[this.mainTagName];
            if (urlData) {
                if (urlData.url === this.url &&
                    (urlData.status === "loading" ||
                        urlData.status === "loaded")) {
                    if (urlData.status === "loaded")
                        this.onComplete(true);
                    return;
                }
            }
            else {
                this.helper.data[this.mainTagName] = {};
            }
            this.helper.data[this.mainTagName].url = this.url;
            this.helper.data[this.mainTagName].status = "loading";
            this.ajaxRedirect.go(this.url, this.element, false, false, false, (success) => {
                this.onComplete(success);
                if (changeUrl) {
                    this.helper.changeUrl(this.url, this.mainTagName);
                }
            });
        }
        isValidUrl(mainTagUrl) {
            // Prevent XSS
            if (mainTagUrl.contains("javascript:")) {
                console.error("Dangerous script detected!!! Request is now aborted!");
                return false;
            }
            // Prevent Open Redirection
            if (mainTagUrl.indexOf("http://") === 0 || mainTagUrl.indexOf("https://") === 0) {
                let newHostName = new URL(mainTagUrl).hostname;
                let currentHostName = new URL(this.urlService.current()).hostname;
                if (newHostName !== currentHostName) {
                    console.error("Dangerous destination detected!!! Request is now aborted!");
                    return false;
                }
            }
            return true;
        }
    }
    exports.default = MainTag;
});
define("olive/components/validate", ["require", "exports", "olive/config"], function (require, exports, config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Validate {
        constructor(alert, responseProcessor) {
            this.alert = alert;
            this.responseProcessor = responseProcessor;
        }
        configure() {
            const methods = $.validator.methods;
            const format = config_1.default.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element)) {
                    return true;
                }
                return moment(value, format).isValid();
            };
            const originalNumberMehtod = methods.number;
            const originalMinMehtod = methods.min;
            const originalMaxMehtod = methods.max;
            const originalRangeMehtod = methods.range;
            const clearMaskedNumber = (value) => value.replace(/,/g, "");
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
        }
        initialize() {
            this.responseProcessor.subformChanged.handle((data) => this.reloadRules(data.trigger.parents("form")));
        }
        /// TODO: this method is obsolete and DI should use instead.
        setTooltipOptions(options) {
            console.warn("MultiSelect.setOptions is obsolete and will be removed in next version.");
            this.tooltipOptions = options;
        }
        validateForm(trigger) {
            if (!this.needsValidation(trigger)) {
                return true;
            }
            const form = this.getForm(trigger);
            const validator = this.getValidator(trigger, form);
            this.extendValidatorSettings(validator, trigger);
            if (!validator.form()) {
                this.handleInvalidForm(validator, form, trigger);
                return false;
            }
            return true;
        }
        reloadRules(form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            // $.validator.unobtrusive.parse(form);
        }
        removeTooltipsRelatedTo(parent) {
            parent.find("[aria-describedby]").each((_, elem) => {
                const id = $(elem).attr("aria-describedby");
                $(`body > #${id}.tooltip`).tooltip("hide");
            });
        }
        needsValidation(trigger) {
            return !trigger.is("[formnovalidate]");
        }
        getForm(trigger) {
            return trigger.closest("form");
        }
        getValidator(trigger, form) {
            return form.validate();
        }
        extendValidatorSettings(validator, trigger) {
            $.extend(validator.settings, {
                tooltip_options: { _all_: this.tooltipOptions },
            });
        }
        focusOnInvalid(validator, form, trigger) {
            validator.focusInvalid();
        }
        showAdditionalErrors(validator) {
            let errorMessage = "";
            $.each(validator.errorList, (_, item) => {
                if (!$(".tooltip:contains('" + item.message + "')")) {
                    errorMessage += item.message + "<br/>";
                }
            });
            if (errorMessage.length > 0) {
                this.alert.alert(errorMessage, "error");
            }
        }
        handleMessageBoxStyle(validator, form, trigger) {
            const alertUntyped = alert;
            if (form.is("[data-validation-style*=message-box]")) {
                alertUntyped(validator.errorList.map((err) => err.message).join("\r\n"), () => { setTimeout(() => this.focusOnInvalid(validator, form, trigger), 0); });
            }
        }
        handleInvalidForm(validator, form, trigger) {
            this.handleMessageBoxStyle(validator, form, trigger);
            this.focusOnInvalid(validator, form, trigger);
            this.showAdditionalErrors(validator);
        }
    }
    exports.default = Validate;
});
define("olive/components/form", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Form {
        constructor(url, validate, waiting, ajaxRedirect) {
            this.url = url;
            this.validate = validate;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.currentRequestUrlProvider = () => window.location.pathAndQuery();
        }
        enableDefaultButtonKeyPress(selector) { selector.off("keypress.default-button").on("keypress.default-button", (e) => this.DefaultButtonKeyPress(e)); }
        enablecleanUpNumberField(selector) {
            selector.off("blur.cleanup-number")
                .on("blur.cleanup-number", (e) => this.cleanUpNumberField($(e.currentTarget)));
        }
        enablesubmitCleanGet(selector) {
            selector.off("submit.clean-up").on("submit.clean-up", (e) => this.submitCleanGet(e));
        }
        getCleanFormData(form) {
            const result = [];
            const disabledOnes = form.find(":disabled").removeAttr("disabled");
            const items = form.serializeArray();
            disabledOnes.attr("disabled", "disabled");
            const groupedByKeys = Array.groupBy(items, (i) => i.name.toLowerCase());
            const numericInputs = new Array();
            form.find("[data-val-range]").map((i, e) => numericInputs.push(e.getAttribute("name")));
            for (const i in groupedByKeys) {
                if (groupedByKeys.hasOwnProperty(i)) {
                    const group = groupedByKeys[i];
                    if (typeof (group) === "function") {
                        continue;
                    }
                    const key = group[0].name;
                    const values = group.map((item) => item.value).filter((v) => v);
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
            $("select[multiple]", form).each((i, e) => {
                const key = $(e).attr("name");
                if (result.filter((v) => v.name === key).length === 0) {
                    result.push({ name: key, value: "" });
                }
            });
            return result;
        }
        ignoreFormDataInput(inputName, values) {
            return false;
        }
        cleanJson(str) {
            return str.replace(/(\s*?{\s*?|\s*?,\s*?)(['"])?([a-zA-Z0-9]+)(['"])?:/g, '$1"$3":');
        }
        getPostData(trigger) {
            let form = trigger.closest("[data-module]");
            if (!form.is("form")) {
                form = $("<form />").append(form.clone(true));
            }
            const data = this.getCleanFormData(form);
            // If it's master-details, then we need the index.
            const subFormContainer = trigger.closest(".subform-item");
            if (subFormContainer) {
                data.push({
                    name: "subFormIndex",
                    value: subFormContainer.closest(".horizontal-subform, .vertical-subform")
                        .find(".subform-item").index(subFormContainer).toString(),
                });
            }
            data.push({ name: "current.request.url", value: this.currentRequestUrlProvider() });
            return data;
        }
        DefaultButtonKeyPress(event) {
            if (event.which === 13) {
                const target = $(event.currentTarget);
                let button = target.closest("[data-module]").find("[default-button]:first"); // Same module
                if (button.length === 0) {
                    button = $("[default-button]:first");
                } // anywhere
                button.click();
                return false;
            }
            else {
                return true;
            }
        }
        cleanUpNumberField(field) {
            const domElement = field.get(0);
            field.val(field.val().replace(/[^\d.-]/g, ""));
        }
        submitCleanGet(event) {
            const form = $(event.currentTarget);
            if (this.validate.validateForm(form) === false) {
                this.waiting.hide();
                return false;
            }
            const formData = this.getCleanFormData(form).filter((item) => item.name !== "__RequestVerificationToken");
            let url = this.url.removeEmptyQueries(form.attr("action"));
            try {
                form.find("input:checkbox:unchecked").each((ind, e) => url = this.url.removeQuery(url, $(e).attr("name")));
                for (const item of formData) {
                    let value = encodeURIComponent(item.value);
                    url = this.url.updateQuery(url, item.name, value);
                }
                url = this.url.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]")) {
                    const link = $(event.currentTarget);
                    if (link != undefined && link != null) {
                        let ajaxTarget = link.attr("ajax-target");
                        let ajaxhref = link.attr("href");
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
        }
    }
    exports.default = Form;
});
define("olive/mvc/standardAction", ["require", "exports", "olive/components/crossDomainEvent"], function (require, exports, crossDomainEvent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class StandardAction {
        constructor(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, mainTagHelper, serviceLocator) {
            this.alert = alert;
            this.form = form;
            this.waiting = waiting;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.select = select;
            this.modalHelper = modalHelper;
            this.mainTagHelper = mainTagHelper;
            this.serviceLocator = serviceLocator;
        }
        initialize() {
            this.responseProcessor.nothingFoundToProcess.handle((data) => this.runAll(data.response, data.trigger));
        }
        runStartup(container = null, trigger = null, stage = "Init") {
            if (container == null)
                container = $(document);
            if (trigger == null)
                trigger = $(document);
            let actions = [];
            $("input[name='Startup.Actions']", container).each((index, item) => {
                let action = $(item).val();
                if (actions.indexOf(action) === -1) {
                    //sometimes, we have a duplicate route in the action string, so we should remove them manually.
                    let names = action.trimStart("[{").trimEnd("}]").split("},{");
                    let uniqueNames = [];
                    $.each(names, (i, el) => {
                        if ($.inArray(el, uniqueNames) === -1)
                            uniqueNames.push(el);
                    });
                    let stringResult = "[{";
                    $.each(uniqueNames, (i, itm) => {
                        stringResult += itm + "},{";
                    });
                    stringResult = stringResult.trimEnd(",{") + "]";
                    var currentUrl = document.URL;
                    if (currentUrl != undefined && currentUrl != null && currentUrl.contains("/hub/project/")) {
                        if (stringResult.contains("[{\"ServiceKey\":\"hub\",\"Function\":\"go\",\"Arguments\":[\"[dashboard]/")) {
                            stringResult = stringResult.replace("true", "false");
                        }
                    }
                    actions.push(stringResult);
                }
            });
            for (let action of actions) {
                if (action && (action.Stage || "Init") == stage)
                    this.runAll(JSON.safeParse(action), trigger);
            }
        }
        runAll(actions, trigger = null) {
            for (let action of actions) {
                if (!this.run(action, trigger))
                    return;
            }
        }
        run(action, trigger) {
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
                let opener = this.modalHelper.currentModal.opener;
                if (window.page.modal.closeMe() === false)
                    return false;
                if (opener) {
                    let data = this.form.getPostData(opener.parents('form'));
                    $.post(window.location.href, data, (response) => {
                        this.responseProcessor.processAjaxResponse(response, opener.closest("[data-module]"), opener, null, null, null);
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
        }
        notify(action, trigger) {
            if (action.Obstruct == false)
                this.alert.alertUnobtrusively(action.Notify, action.Style);
            else
                this.alert.alert(action.Notify, action.Style);
        }
        redirect(action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && window.isModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal({ currentTarget: trigger }, action.Redirect, null);
            else if (action.Target && action.Target.indexOf('$') === 0)
                this.renderMainTag({ currentTarget: trigger }, action.redirect);
            else if (action.Target && action.Target != '')
                window.open(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true) {
                const link = $(action.Target);
                if (link != undefined && link != null) {
                    let ajaxTarget = link.attr("ajax-target");
                    let ajaxhref = link.attr("href");
                    this.ajaxRedirect.go(action.Redirect, trigger, false, false, true, undefined, ajaxTarget, ajaxhref);
                }
                else {
                    this.ajaxRedirect.go(action.Redirect, trigger, false, false, true);
                }
            }
            else
                location.replace(action.Redirect);
        }
        openModal(event, url, options) {
            this.modalHelper.close();
            setTimeout(() => this.modalHelper.open(event, url, options), 0);
        }
        renderMainTag(event, url) {
            setTimeout(() => this.mainTagHelper.render(event, url), 0);
        }
        loadServiceAfterConfiguration(serviceConfigurationUrl, key, func, args) {
            window.requirejs([serviceConfigurationUrl], () => {
                this.loadService(key, func, args);
            });
        }
        loadService(key, func, args) {
            //this.serviceLocator.getService<any>(key)[func].Apply({}, args);
            const obj = this.serviceLocator.getService(key);
            const method = obj[func];
            method.apply(obj, args);
        }
    }
    exports.default = StandardAction;
});
define("olive/mvc/serverInvoker", ["require", "exports", "olive/config"], function (require, exports, config_2) {
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
            let disableToo = config_2.default.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
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
define("olive/mvc/windowEx", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WindowEx {
        constructor(modalHelper, ajaxRedirect) {
            this.modalHelper = modalHelper;
            this.ajaxRedirect = ajaxRedirect;
        }
        enableBack(selector) {
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
        }
        back(event) {
            if (this.modalHelper.isOrGoingToBeModal())
                window.location.reload();
            else {
                if (this.ajaxRedirect.ajaxChangedUrl == 0)
                    return;
                this.ajaxRedirect.ajaxChangedUrl--;
                const link = $(event.currentTarget);
                if (link != undefined && link != null) {
                    let ajaxTarget = link.attr("ajax-target");
                    let ajaxhref = link.attr("href");
                    this.ajaxRedirect.go(location.href, null, false, false, true, undefined, ajaxTarget, ajaxhref);
                }
                else {
                    this.ajaxRedirect.go(location.href, null, true, false, false);
                }
            }
        }
    }
    exports.default = WindowEx;
});
define("olive/extensions/jQueryExtensions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUniqueSelector = exports.raiseEvent = exports.enableValidateForCheckboxList = exports.bindFirst = exports.screenOffset = exports.enableValidateForTimePicker = void 0;
    const enableValidateForTimePicker = () => {
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
    const enableValidateForCheckboxList = () => {
        $.validator.unobtrusive.adapters.add("selection-required", (options) => {
            if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
                var $element = $(options.element);
                options.rules["required"] = true;
                options.messages["required"] = $element.data('valRequired');
            }
        });
    };
    exports.enableValidateForCheckboxList = enableValidateForCheckboxList;
    const raiseEvent = (event, owner, data) => {
        let result = true;
        if (owner.event.hasOwnProperty(event)) {
            owner.event[event].forEach(handler => {
                let res = handler(data || {});
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
            let realNode = node[0];
            let name = realNode.localName;
            if (!name)
                break;
            name = name.toLowerCase();
            let parent = node.parent();
            let siblings = parent.children(name);
            if (siblings.length > 1) {
                name += ':eq(' + siblings.index(realNode) + ')';
            }
            path = name + (path ? '>' + path : '');
            node = parent;
        }
        return path;
    }
    exports.getUniqueSelector = getUniqueSelector;
});
define("olive/extensions/systemExtensions", ["require", "exports", "olive/extensions/jQueryExtensions"], function (require, exports, jq) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SystemExtensions {
        static initialize() {
            window.download = this.download;
            Array.groupBy = this.groupBy;
            JSON.safeParse = this.safeParse;
            this.extendString();
            window.location.pathAndQuery = () => window.location.pathname + window.location.search;
            jq.enableValidateForCheckboxList();
            jq.enableValidateForTimePicker();
            $.fn.extend({
                screenOffset: jq.screenOffset,
                bindFirst: jq.bindFirst,
                //clone: jq.clone,
                raiseEvent: jq.raiseEvent,
                getUniqueSelector: jq.getUniqueSelector
            });
        }
        static extend(type, name, implementation) {
            var proto = type.prototype;
            if (implementation.length == 0)
                throw new Error("extend function needs at least one argument.");
            else if (implementation.length == 1)
                proto[name] = function () { return implementation(this); };
            else if (implementation.length == 2)
                proto[name] = function (arg) { return implementation(this, arg); };
            else if (implementation.length == 3)
                proto[name] = function (a1, a2) { return implementation(this, a1, a2); };
        }
        static extendString() {
            this.extend(String, "endsWith", (instance, searchString) => {
                var position = instance.length - searchString.length;
                var lastIndex = instance.indexOf(searchString, position);
                return lastIndex !== -1 && lastIndex === position;
            });
            this.extend(String, "htmlEncode", instance => {
                var a = document.createElement('a');
                a.appendChild(document.createTextNode(instance));
                return a.innerHTML;
            });
            this.extend(String, "htmlDecode", instance => {
                var a = document.createElement('a');
                a.innerHTML = instance;
                return a.textContent;
            });
            this.extend(String, "startsWith", (instance, text) => instance.indexOf(text) === 0);
            this.extend(String, "withPrefix", (instance, prefix) => instance.startsWith(prefix) === false ? prefix + instance : instance);
            this.extend(String, "trimText", (instance, text) => instance.trimStart(text).trimEnd(text));
            this.extend(String, "trimStart", (instance, text) => instance.startsWith(text) ? instance.slice(text.length) : instance);
            this.extend(String, "trimEnd", (instance, text) => instance.endsWith(text) ? instance.slice(0, instance.lastIndexOf(text)) : instance);
            this.extend(String, "contains", (instance, text) => instance.indexOf(text) > -1);
        }
        static safeParse(data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                console.log('Cannot parse this data to Json: ');
                throw error;
            }
        }
        static download(url) {
            $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
        }
        static groupBy(array, groupFunction) {
            var groups = {};
            array.forEach((o) => {
                var group = JSON.stringify(groupFunction(o));
                groups[group] = groups[group] || [];
                groups[group].push(o);
            });
            return Object.keys(groups).map((g) => groups[g]);
        }
    }
    exports.default = SystemExtensions;
});
define("olive/components/sorting", ["require", "exports", "jquery-sortable", "jquery-ui-touch-punch"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Sorting {
        constructor(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        enableDragSort(selector) { selector.each((i, e) => this.DragSort($(e))); }
        enablesetSortHeaderClass(selector) { selector.each((i, e) => this.setSortHeaderClass($(e))); }
        enableAjaxSorting(selector) {
            selector.off("click.ajax-sorting").on("click.ajax-sorting", (e) => this.AjaxSorting(e));
        }
        AjaxSorting(event) {
            const button = $(event.currentTarget);
            let sort = button.attr("data-sort");
            let key = "s";
            if (sort.split("=").length > 1) {
                key = sort.split("=")[0];
                sort = sort.split("=")[1];
            }
            const input = $("[name='" + key + "']");
            if (input.val() === sort) {
                sort += ".DESC";
            }
            input.val(sort);
        }
        setSortHeaderClass(thead) {
            const currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
            if (currentSort === "") {
                return;
            }
            const sortKey = currentSort.replace(".DESC", "").replace(".ASC", "");
            const currentThead = $("[data-sort='" + sortKey + "']");
            if (currentSort.contains(".DESC")) {
                currentThead.removeClass("sort-ascending");
                currentThead.addClass("sort-descending");
            }
            else {
                currentThead.removeClass("sort-descending");
                currentThead.addClass("sort-ascending");
            }
            currentThead.append("<i />");
        }
        DragSort(container) {
            const itemsSelector = "> li";
            const config = {
                handle: "[data-sort-item]",
                containment: "parent",
                axis: "y",
                tolerance: "pointer",
                scroll: true,
                items: itemsSelector,
                helper: (e, ui) => {
                    // prevent TD collapse during drag
                    ui.children().each((i, c) => $(c).width($(c).width()));
                    return ui;
                },
                stop: (e, ui) => {
                    $(ui).children().removeAttr("style");
                    container.find(itemsSelector).children().removeAttr("style");
                    const dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                    const handle = ui.item.find("[data-sort-item]");
                    let actionUrl = handle.attr("data-sort-action");
                    actionUrl = this.url.addQuery(actionUrl, "drop-before", dropBefore);
                    actionUrl = this.url.effectiveUrlProvider(actionUrl, handle);
                    this.serverInvoker.invokeWithAjax({ currentTarget: handle.get(0) }, actionUrl);
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
        }
    }
    exports.default = Sorting;
});
define("olive/components/paging", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Paging {
        constructor(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        enableOnSizeChanged(selector) {
            selector.off("change.pagination-size").on("change.pagination-size", e => this.onSizeChanged(e));
        }
        enableWithAjax(selector) {
            selector.off("click.ajax-paging").on("click.ajax-paging", e => this.withAjax(e));
        }
        onSizeChanged(event) {
            let form = $(event.currentTarget).closest("form");
            if (form.length === 0)
                return;
            if (form.attr("method") == "get")
                form.submit();
            else {
                let actionUrl = this.url.effectiveUrlProvider(form.attr("action"), $(event.currentTarget));
                this.serverInvoker.invokeWithAjax(event, actionUrl);
            }
        }
        withAjax(event) {
            let button = $(event.currentTarget);
            let page = button.attr("data-pagination");
            let key = "p";
            if (page.split('=').length > 1) {
                key = page.split('=')[0];
                page = page.split('=')[1];
            }
            let input = $("[name='" + key + "']");
            input.val(page);
            if (input.val() != page) {
                // Drop down list case
                input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
                input.remove();
            }
        }
    }
    exports.default = Paging;
});
define("olive/components/masterDetail", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MasterDetail {
        constructor(validate, responseProcessor) {
            this.validate = validate;
            this.responseProcessor = responseProcessor;
        }
        initialize() {
            this.responseProcessor.subformChanged.handle((_) => this.updateSubFormStates());
        }
        enable(selector) {
            selector.off("click.delete-subform").on("click.delete-subform", (e) => this.deleteSubForm(e));
        }
        updateSubFormStates() {
            const countItems = (element) => $(element).parent().find(".subform-item:visible").length;
            // Hide removed items
            $("input[name$=MustBeDeleted][value=False]").val("false");
            $("input[name$=MustBeDeleted][value=True]").val("true");
            $("input[name$=MustBeDeleted][value=true]").closest(".subform-item").hide();
            // hide empty headers
            $(".horizontal-subform thead").each((i, e) => $(e).css("visibility", (countItems(e) > 0) ? "visible" : "hidden"));
            // Hide add buttons
            $("[data-subform-max]").each((i, e) => {
                const show = countItems(e) < parseInt($(e).attr("data-subform-max"), 10);
                $(e).closest("[data-module]").find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
            });
            // Hide delete buttons
            $("[data-subform-min]").each((i, e) => {
                const show = countItems(e) > parseInt($(e).attr("data-subform-min"), 10);
                $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css("visibility", (show) ? "visible" : "hidden");
            });
        }
        deleteSubForm(event) {
            const button = $(event.currentTarget);
            const container = button.parents(".subform-item");
            this.validate.removeTooltipsRelatedTo(container);
            container.find("input[name$=MustBeDeleted]").val("true");
            container.find("[data-val=true]").attr("readonly", "readonly");
            this.updateSubFormStates();
            event.preventDefault();
        }
    }
    exports.default = MasterDetail;
});
define("olive/components/grid", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Grid {
        enableColumn(element) {
            element.off("click.apply-columns").on("click.apply-columns", e => this.applyColumns(e));
        }
        enableToggle(element) {
            element.off("change.select-all").on("change.select-all", e => this.enableSelectAllToggle(e));
        }
        enableHlightRow(element) {
            this.highlightRow(element);
        }
        enableSelectCol(selector) {
            selector.each((i, e) => this.enableSelectColumns($(e)));
        }
        applyColumns(event) {
            let button = $(event.currentTarget);
            let checkboxes = button.closest(".select-cols").find(":checkbox");
            if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0)
                return;
            $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
                .appendTo(button.parent());
        }
        enableSelectColumns(container) {
            let columns = container.find("div.select-cols");
            container.find("a.select-cols").click(() => { columns.show(); return false; });
            columns.find('.cancel').click(() => columns.hide());
        }
        enableSelectAllToggle(event) {
            let trigger = $(event.currentTarget);
            trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
        }
        highlightRow(element) {
            let target = $(element.closest("tr"));
            target.siblings('tr').removeClass('highlighted');
            target.addClass('highlighted');
        }
        mergeActionButtons() {
            $("table tr > .actions-merge, .r-grid .r-grid-row > .actions-merge").each((index, item) => {
                let current = $(item);
                if (current.next().length === 0 && current.children("a,button").length <= 1)
                    return;
                var mergedContent;
                if (current.children("a").length > 0) {
                    mergedContent = {};
                    current.children("a").each((i, innerLink) => {
                        let selected = $(innerLink);
                        mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                    });
                }
                if (current.children("button").length > 0) {
                    if (!mergedContent)
                        mergedContent = {};
                    current.children("button").each((i, innerLink) => {
                        let selected = $(innerLink);
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
                current.nextAll(".actions-merge").each((i, innerItem) => {
                    if (typeof mergedContent === "string")
                        mergedContent += " " + $(innerItem).html();
                    else {
                        let currentInnerItem = $(innerItem);
                        currentInnerItem.children("a").each((i, innerLink) => {
                            let selected = $(innerLink);
                            mergedContent[selected.text().trim()] = selected.attr("href").trim() + "#ATTRIBUTE#target='" + selected.attr("target") + "' data-redirect='" + selected.attr("data-redirect") + "'";
                        });
                        currentInnerItem.children("button").each((i, innerLink) => {
                            let selected = $(innerLink);
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
                    let dropDownList = `<div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Select action
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">`;
                    for (let val in mergedContent) {
                        let urlAddress = mergedContent[val].split("#ATTRIBUTE#");
                        if (urlAddress[1].startsWith("#BUTTON#")) {
                            urlAddress[1] = urlAddress[1].replace("#BUTTON#", "");
                            dropDownList += `<a class="dropdown-item" href="#" formaction="${urlAddress[0]}" ${urlAddress[1]}>${val}</a>`;
                        }
                        else
                            dropDownList += `<a class="dropdown-item" href="${urlAddress[0]}" ${urlAddress[1]}>${val}</a>`;
                    }
                    dropDownList += "</div></div>";
                    current.empty().append($(dropDownList));
                }
                current.nextAll(".actions-merge").remove();
            });
        }
    }
    exports.default = Grid;
});
define("olive/plugins/passwordStength", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PasswordStength {
        static enable(selector) { selector.each((i, e) => new PasswordStength($(e)).enable()); }
        constructor(container) {
            this.container = container;
        }
        enable() {
            // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md
            if (this.container.find(".progress").length !== 0)
                return;
            let formGroup = this.container.closest(".form-group");
            let options = {
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
            let password = formGroup.find(":password");
            if (password.length == 0) {
                console.log('Error: no password field found for password strength.');
                console.log(this.container);
            }
            else
                password.pwstrength(options);
        }
    }
    exports.default = PasswordStength;
});
define("olive/plugins/htmlEditor", ["require", "exports", "olive/config"], function (require, exports, config_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HtmlEditorFactory = void 0;
    class HtmlEditorFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new HtmlEditor($(e), this.modalHelper).enable()); }
    }
    exports.HtmlEditorFactory = HtmlEditorFactory;
    class HtmlEditor {
        constructor(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        enable() {
            if (this.input.css("display") === "none")
                return;
            window["CKEDITOR_BASEPATH"] = config_3.default.CK_EDITOR_BASE_PATH;
            this.onDemandScript(config_3.default.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCkEditorScriptReady());
        }
        onCkEditorScriptReady() {
            CKEDITOR.basePath = config_3.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_3.default.CK_EDITOR_BASE_PATH + 'contents.css';
            let editor = CKEDITOR.replace(this.input.attr('name'), this.getEditorSettings());
            editor.on('change', (evt) => evt.editor.updateElement());
            editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
        }
        getEditorSettings() {
            return {
                toolbar: this.input.attr('data-toolbar') || config_3.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
            };
        }
        onDemandScript(url, callback) {
            callback = (typeof callback !== "undefined") ? callback : {};
            $.ajax({
                type: "GET",
                url: url,
                success: callback,
                dataType: "script",
                cache: true
            });
        }
    }
    HtmlEditor.editorConfigPath = "/scripts/ckeditor_config.js";
    exports.default = HtmlEditor;
});
define("olive/plugins/timeControl", ["require", "exports", "olive/config"], function (require, exports, config_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimeControlFactory = void 0;
    class TimeControlFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new TimeControl($(e), this.modalHelper)); }
    }
    exports.TimeControlFactory = TimeControlFactory;
    class TimeControl {
        constructor(targetInput, modalHelper) {
            this.modalHelper = modalHelper;
            let input = targetInput;
            if (window.isModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
            }
            input.attr("data-autofocus", "disabled");
            const options = {
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
            input.parent().find(".fa-clock-o").parent(".input-group-addon").click(() => { input.focus(); });
        }
    }
    exports.default = TimeControl;
});
define("olive/plugins/autoComplete", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoCompleteFactory = void 0;
    class AutoCompleteFactory {
        constructor(url, form, serverInvoker) {
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        enable(selector) {
            selector.each((i, e) => new AutoComplete($(e), this.url, this.form, this.serverInvoker).enable());
        }
    }
    exports.AutoCompleteFactory = AutoCompleteFactory;
    class AutoComplete {
        static setOptions(options) {
            AutoComplete.customOptions = options;
        }
        constructor(input, url, form, serverInvoker) {
            this.input = input;
            this.url = url;
            this.form = form;
            this.serverInvoker = serverInvoker;
        }
        enable() {
            if (this.input.is("[data-typeahead-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-typeahead-enabled", "true");
            }
            if (this.input.is("[data-change-action]")) {
                this.serverInvoker.enableInvokeWithAjax(this.input, "typeahead:select", "data-change-action");
                this.input.on("change.deselect", (event) => {
                    setTimeout(() => {
                        if (!this.valueField.val() && this.selectedItemOnEnter) {
                            this.input.trigger("typeahead:select", { event, item: undefined });
                        }
                    }, 100);
                });
                this.input.on("focus.deselect", () => this.selectedItemOnEnter = this.valueField.val());
            }
            this.input.wrap("<div class='typeahead__container'></div>");
            this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");
            this.input
                .wrap("<span class='typehead-chevron-down'></span>")
                .before('<i class="fas fa-chevron-down"></i>')
                .data("selected-text", "")
                .on("input", () => this.clearValue())
                .typeahead($.extend(true, this.getDefaultOptions(), AutoComplete.customOptions, this.getMandatoryOptions()));
            var chevorchild = this.input.parent().children().first();
            chevorchild.on("click", () => this.input.trigger("focus.select"));
            chevorchild.on("click", () => this.input.trigger("click"));
            var chevr = $("fa-chevron-down");
            chevr.on("click", () => this.input.trigger("focus.select"));
            chevr.on("click", () => this.input.trigger("click"));
        }
        getMandatoryOptions() {
            let url = this.input.attr("autocomplete-source") || "";
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
                        ajax: (_) => {
                            return {
                                type: "POST",
                                url,
                                data: this.getPostData(),
                                xhrFields: { withCredentials: true },
                            };
                        },
                    },
                },
                callback: this.getMandatoryCallbacks(),
            };
        }
        getMandatoryCallbacks() {
            let callback = {
                onClickAfter: (node, a, item, event) => {
                    this.itemSelected(item);
                    this.input.trigger("typeahead:select", { event, item });
                },
                onPopulateSource: (node, data) => {
                    const text = this.input.val();
                    const index = data.findIndex((x) => (x.Text || '').trim().toLowerCase() === text.toLowerCase().trim());
                    if (index >= 0) {
                        this.valueField.val(data[index].Value);
                    }
                    return data;
                },
            };
            if (this.input.data("strict") === true) {
                callback = $.extend(callback, {
                    onHideLayout: () => {
                        if (this.valueField.val() === "") {
                            this.input.val("");
                        }
                    },
                });
            }
            return callback;
        }
        getDefaultOptions() {
            const clientSideSearch = this.input.attr("clientside") || false;
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
        }
        getPostData() {
            const postData = this.toObject(this.form.getPostData(this.input));
            postData[this.input.attr("name")] = "{{query}}";
            return postData;
        }
        clearValue() {
            if (this.input.val() === "") {
                this.valueField.val("");
            }
            if (this.input.val() !== this.input.data("selected-text")) {
                this.valueField.val("");
            }
        }
        itemSelected(item) {
            if (item) {
                let txt = (item.Text === null || item.Text === undefined || item.Text.trim() === "") ?
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
        }
        // Convert current form array to simple plain object
        toObject(arr) {
            const rv = {};
            for (const item of arr) {
                rv[item.name] = item.value;
            }
            return rv;
        }
    }
    exports.default = AutoComplete;
});
define("olive/plugins/globalSearch", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionEnum = exports.AjaxState = exports.GlobalSearchFactory = void 0;
    class GlobalSearchFactory {
        constructor(waiting, modalHelper) {
            this.waiting = waiting;
            this.modalHelper = modalHelper;
        }
        enable(selector) {
            selector.each((i, e) => new GlobalSearch($(e), this.waiting, this.modalHelper).enable());
        }
    }
    exports.GlobalSearchFactory = GlobalSearchFactory;
    class GlobalSearch {
        boldSearch(str, searchText) {
            if (!str)
                return "";
            return str.replace(new RegExp('(' + searchText + ')', "gi"), "<b>$1</b>");
        }
        boldSearchAll(str, searchText) {
            let result = str;
            if (searchText) {
                const splitedsearchtext = searchText.split(" ");
                for (const strST of splitedsearchtext) {
                    result = this.boldSearch(result, strST);
                }
            }
            return result;
        }
        constructor(input, waiting, modalHelper) {
            this.input = input;
            this.waiting = waiting;
            this.isTyping = false;
            this.searchedText = null;
            this.modalHelper = modalHelper;
        }
        enable() {
            if (this.input.is("[data-globalsearch-enabled=true]")) {
                return;
            }
            else {
                this.input.attr("data-globalsearch-enabled", "true");
            }
            $('#global-search-modal').on('shown.bs.modal', function () {
                $('#global-search-modal .form-control').trigger('focus');
            });
            this.urlList = (this.input.attr("data-search-source") || "").split(";");
            this.resultItemClass = this.input.attr("data-result-item-class");
            this.panel = $("#global-search-modal .global-search-panel");
            this.helpPanel = $("#global-search-modal .global-search-help");
            this.groupsPanel = $("#global-search-modal .global-search-groups");
            this.resultsPanel = $("#global-search-modal .global-search-results");
            let timeout = null;
            this.input.keyup((e) => {
                if (e.keyCode === 27) {
                    return;
                }
                this.isTyping = true;
                clearTimeout(timeout);
                timeout = setTimeout((() => {
                    this.isTyping = false;
                    if (this.searchedText !== this.input.val().trim()) {
                        this.createSearchComponent(this.urlList);
                    }
                }), 300);
            });
        }
        createSearchComponent(urls) {
            this.searchedText = this.input.val().trim();
            this.groupsPanel.empty();
            this.resultsPanel.empty();
            if (this.searchedText) {
                this.helpPanel.hide();
            }
            else {
                this.helpPanel.show();
                return;
            }
            const ajaxList = urls.map((p) => {
                const icon = p.split("#")[1].trim();
                return {
                    url: p.split("#")[0].trim(),
                    icon,
                    state: AjaxState.pending,
                };
            });
            const context = {
                ajaxList,
                resultCount: 0,
                groupsPanel: this.groupsPanel,
                resultsPanel: this.resultsPanel,
                beginSearchStarted: true,
                searchedText: this.searchedText,
            };
            if (context.ajaxList.length)
                this.waiting.show();
            for (const ajaxObject of context.ajaxList) {
                ajaxObject.ajx = $
                    .ajax({
                    dataType: "json",
                    url: ajaxObject.url,
                    xhrFields: { withCredentials: true },
                    async: true,
                    data: { searcher: context.searchedText },
                    success: (result) => this.onSuccess(ajaxObject, context, result),
                    complete: (jqXhr) => this.onComplete(context, jqXhr),
                    error: (jqXhr) => this.onError(ajaxObject, jqXhr),
                });
            }
        }
        onSuccess(sender, context, result) {
            if (this.isTyping) {
                return;
            }
            sender.result = result;
            if (result === null || result === void 0 ? void 0 : result.length) {
                sender.state = AjaxState.success;
                // Results from GlobalSearch MS have the GroupTitle in their description field separated with $$$
                var resultWithType = result.map(x => {
                    if (x.Description === null || x.Description.indexOf("$$$") < 0) {
                        return x;
                    }
                    var descArray = x.Description.split("$$$");
                    var groupTitle = descArray.shift();
                    x.GroupTitle = groupTitle;
                    x.Description = descArray.join("");
                    return x;
                });
                const groupedByResult = this.groupBy(resultWithType, 'GroupTitle');
                let index = 0;
                for (let item in groupedByResult) {
                    if (!groupedByResult[item].length)
                        continue;
                    this.createSearchItems(sender, context, index++, item, groupedByResult[item]);
                    if (context.beginSearchStarted && result.length > 0) {
                        context.beginSearchStarted = false;
                    }
                }
            }
            else {
                sender.state = AjaxState.failed;
                console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
            }
        }
        isValidResult(item, context) {
            let resfilter = false;
            if (context.searchedText) {
                const arfilter = context.searchedText.split(" ");
                for (const strfilter of arfilter) {
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
        }
        createSearchItems(sender, context, groupIndex, groupTitle, items) {
            var _a;
            groupTitle = groupTitle || ((items === null || items === void 0 ? void 0 : items.length) > 0 && ((_a = items[0].GroupTitle) === null || _a === void 0 ? void 0 : _a.length) > 0) ?
                items[0].GroupTitle : sender.url.split(".")[0]
                .replace("https://", "")
                .replace("http://", "")
                .replace("'", "")
                .replace("\"", "")
                .toUpperCase();
            const id = ((groupTitle || 'group').replace(/ /g, "-")) + "-" + groupIndex;
            const active = this.groupsPanel.children().length == 0 ? "active" : "";
            const searchTitle = $(`<li class='nav-item'><a class='nav-link ${active}' href='#${id}' role='tab' data-toggle='tab'><i class='${sender.icon}'></i> ${groupTitle || "Global"} <span class='badge badge-secondary'>${items.length}</span></a></li>`);
            // we may need to use the search title to implement show more.
            // but we may only need to add li (show more) at the end of list and after it is clicked,
            // it makes all hidden items visible
            this.groupsPanel.append(searchTitle);
            let childrenItems = $("<div class='row'>");
            const maxResultItemsCount = 100;
            for (let i = 0; i < items.length && i < maxResultItemsCount; i++) {
                context.resultCount++;
                childrenItems.append(this.createItem(items[i], context));
            }
            childrenItems = $("<div role='tabpanel' class='tab-pane " + active + "' id='" + id + "'>").append(childrenItems);
            if ((items === null || items === void 0 ? void 0 : items.length) > 0 && items[0].Colour) {
                childrenItems.css("color", items[0].Colour);
            }
            $(childrenItems).find("[target='$modal'][href]").off("click").click(function () {
                $('#global-search-modal').modal('hide');
            });
            this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));
            this.resultsPanel.append(childrenItems);
        }
        createItem(item, context) {
            var attr = "";
            if (item.Action == ActionEnum.Popup)
                attr = "target=\"$modal\"";
            else if (item.Action == ActionEnum.NewWindow)
                attr = "target=\"_blank\"";
            return $(`<div class='${this.resultItemClass}'>` +
                `<div class='search-item'>` +
                `<div class='icon'>` +
                `<a name='Photo' class='profile-photo' href='${item.Url}'>` +
                (!item.IconUrl ? "<div class='icon'></div>" : this.showIcon(item)) +
                `</a>` +
                `</div>` +
                `<div class='result-item-content'>` +
                `<div class='type'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.GroupTitle, context.searchedText)}</a></div>` +
                `<div class='title'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Title, context.searchedText)}</a></div>` +
                `<div class='body'><a href='${item.Url}' ${attr}>${this.boldSearchAll(item.Description, context.searchedText)}</a></div>` +
                `</div>` +
                `</div>` +
                `</div>`);
        }
        onComplete(context, jqXHR) {
            if (context.ajaxList.filter((p) => p.state === 0).length === 0) {
                this.waiting.hide();
                if (context.resultCount === 0) {
                    context.resultsPanel.html("Nothing found");
                }
            }
        }
        onError(sender, jqXHR) {
            sender.state = AjaxState.failed;
            // this.resultsPanel.append($("ajax failed Loading data from source [" + sender.url + "]"));
            console.error(jqXHR);
        }
        showIcon(item) {
            if (item.IconUrl.indexOf("fa-") > 0) {
                return `<span class='icon-background' style='background-color: ${item.Colour}'><span class='${item.IconUrl}'></span></span>`;
            }
            else {
                return `<img src='${item.IconUrl}' />`;
            }
        }
        groupBy(array, key) {
            return array.reduce((rv, x) => {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        }
    }
    exports.default = GlobalSearch;
    var AjaxState;
    (function (AjaxState) {
        AjaxState[AjaxState["pending"] = 0] = "pending";
        AjaxState[AjaxState["success"] = 1] = "success";
        AjaxState[AjaxState["failed"] = 2] = "failed";
    })(AjaxState || (exports.AjaxState = AjaxState = {}));
    var ActionEnum;
    (function (ActionEnum) {
        ActionEnum[ActionEnum["Redirect"] = 0] = "Redirect";
        ActionEnum[ActionEnum["Popup"] = 1] = "Popup";
        ActionEnum[ActionEnum["NewWindow"] = 2] = "NewWindow";
    })(ActionEnum || (exports.ActionEnum = ActionEnum = {}));
});
define("olive/plugins/slider", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SliderFactory = void 0;
    class SliderFactory {
        constructor(form) {
            this.form = form;
        }
        enable(selector) { selector.each((i, e) => new Slider($(e), this.form).enable()); }
    }
    exports.SliderFactory = SliderFactory;
    class Slider {
        constructor(targetInput, form) {
            this.form = form;
            this.input = targetInput;
            this.options = { min: 0, max: 100, value: null, range: false, formatter: null, tooltip: 'always', upper: null, tooltip_split: false };
        }
        enable() {
            let data_options = this.input.attr("data-options") ? JSON.parse(this.form.cleanJson(this.input.attr("data-options"))) : null;
            if (data_options)
                $.extend(true, this.options, data_options);
            this.options.range = this.input.attr("data-control") == "range-slider";
            if (this.options.range) {
                if (this.options.tooltip_split == false)
                    this.options.formatter = v => v[0] + " - " + v[1];
                if (this.input.attr("id").endsWith("Max"))
                    return;
                let maxInput = $('[name="' + this.input.attr("id").split('.')[0] + "." + this.options.upper + '\"]');
                if (maxInput.length == 0)
                    maxInput = $('[name="' + (this.options.upper || (this.input.attr("id") + 'Max')) + '\"]');
                if (maxInput.length == 0)
                    throw new Error("Upper input was not found for the range slider.");
                this.options.value = [Number(this.input.val() || this.options.min), Number(maxInput.val() || this.options.max)];
                // Standard SEARCH min and max.														 
                // TODO: Change the following to first detect if we're in a search control context and skip the following otherwise.
                let container = $(this.input).closest(".group-control");
                if (container.length == 0)
                    container = this.input.parent();
                container.children().each((i, e) => $(e).hide());
                let rangeSlider = $("<input type='text' class='range-slider'/>").attr("id", this.input.attr("id") + "_slider").appendTo(container);
                rangeSlider.slider(this.options).on('change', ev => { this.input.val(ev.value.newValue[0]); maxInput.val(ev.value.newValue[1]); }); ///// Updated ***********
            }
            else {
                this.options.value = Number(this.input.val() || this.options.min);
                this.input.slider(this.options).on('change', ev => { this.input.val(ev.value.newValue); }); ///// Updated ***********
            }
        }
    }
    exports.default = Slider;
});
define("olive/plugins/dateTimePickerBase", ["require", "exports", "olive/config"], function (require, exports, config_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class dateTimePickerBase {
        constructor(input, modalHelper) {
            this.input = input;
            this.modalHelper = modalHelper;
        }
        show() {
            if (window.isModal()) {
                this.input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
                this.input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", e => this.modalHelper.expandToFitPicker(e));
            }
            this.input.attr("data-autofocus", "disabled");
            const control = this.input.data("control");
            const stepping = Number(this.input.data("minute-steps") || "1");
            var minimumDate = this.input.attr("min-date") || "null";
            var maximumDate = this.input.attr("max-date") || "null";
            if (minimumDate == undefined || minimumDate == null || minimumDate == "null") {
                minimumDate = "01/01/1900";
            }
            if (maximumDate == undefined || maximumDate == null || maximumDate == "null") {
                maximumDate = "01/01/2090";
            }
            if (control == this.controlType) {
                const options = {
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
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").click(() => this.input.focus());
            }
            else
                alert("Don't know how to handle date control of " + control);
        }
    }
    exports.default = dateTimePickerBase;
});
define("olive/plugins/datePicker", ["require", "exports", "olive/config", "olive/plugins/dateTimePickerBase"], function (require, exports, config_6, dateTimePickerBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatePickerFactory = void 0;
    class DatePickerFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new DatePicker($(e), this.modalHelper).show()); }
    }
    exports.DatePickerFactory = DatePickerFactory;
    class DatePicker extends dateTimePickerBase_1.default {
        constructor(targetInput, modalHelper) {
            super(targetInput, modalHelper);
            this.controlType = "date-picker";
            this.format = config_6.default.DATE_FORMAT;
        }
        modifyOptions(options) {
            $.extend(options, {
                viewMode: this.input.attr("data-view-mode") || 'days',
            });
        }
    }
    exports.default = DatePicker;
});
define("olive/plugins/dateTimePicker", ["require", "exports", "olive/plugins/dateTimePickerBase", "olive/config"], function (require, exports, dateTimePickerBase_2, config_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DateTimePickerFactory = void 0;
    class DateTimePickerFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new DateTimePicker($(e), this.modalHelper).show()); }
    }
    exports.DateTimePickerFactory = DateTimePickerFactory;
    class DateTimePicker extends dateTimePickerBase_2.default {
        constructor(targetInput, modalHelper) {
            super(targetInput, modalHelper);
            this.controlType = "date-picker|time-picker";
            this.format = config_7.default.DATE_TIME_FORMAT;
        }
        modifyOptions(options) {
            $.extend(options, {
                sideBySide: true,
                showClear: true,
            });
        }
    }
    exports.default = DateTimePicker;
});
define("olive/plugins/numericUpDown", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NumbericUpDown {
        static enable(selector) { selector.each((i, e) => new NumbericUpDown($(e)).enable()); }
        constructor(input) {
            this.input = input;
        }
        enable() {
            let min = this.input.attr("data-val-range-min");
            let max = this.input.attr("data-val-range-max");
            this.input.spinedit({
                minimum: parseFloat(min),
                maximum: parseFloat(max),
                step: 1,
            });
        }
    }
    exports.default = NumbericUpDown;
});
define("olive/plugins/fileUpload", ["require", "exports", "olive/components/crossDomainEvent", "file-style"], function (require, exports, crossDomainEvent_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileUploadS3 = exports.FileUploadFactory = void 0;
    // For configuration see:
    // http://markusslima.github.io/bootstrap-filestyle/
    // https://blueimp.github.io/jQuery-File-Upload/
    class FileUploadFactory {
        constructor(url, serverInvoker) {
            this.url = url;
            this.serverInvoker = serverInvoker;
        }
        enable(selector) {
            selector.each((_, e) => {
                const input = $(e);
                const s3Url = input.data("s3-url");
                if (!s3Url) {
                    new FileUpload(input, this.url, this.serverInvoker).enable();
                }
                else {
                    new FileUploadS3(input, this.url, this.serverInvoker, s3Url).enable();
                }
            });
        }
    }
    exports.FileUploadFactory = FileUploadFactory;
    class FileUpload {
        constructor(input, url, serverInvoker) {
            this.input = input;
            this.url = url;
            this.serverInvoker = serverInvoker;
            this.onUploadError = (jqXHR, status, error) => {
                this.serverInvoker.onAjaxResponseError(jqXHR, status, error);
                this.filenameInput.val("");
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
            this.deleteButton = this.container.find(".delete-file").click((e) => this.onDeleteButtonClicked());
        }
        enable() {
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
        }
        getDataUrlAttribute() {
            return this.url.effectiveUrlProvider("/upload", this.input);
        }
        getFilestyleOptions() {
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
        }
        getFileuploadOptions() {
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
        }
        fixMasterDetailsInputName() {
            const nameParts = this.input.attr("name").split(".");
            this.input.attr("name", nameParts[nameParts.length - 1]);
        }
        hasExistingFile() {
            if (!this.currentFileLink) {
                return false;
            }
            const name = this.currentFileLink.text();
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
        }
        showExistingFile() {
            this.deleteButton.show();
            this.progressBar.width("100%");
            this.existingFileNameInput
                .val(this.currentFileLink.text())
                .removeAttr("disabled")
                .addClass("file-target")
                .attr("readonly", "readonly")
                .click(() => this.currentFileLink[0].click());
            this.setValidationValue("value");
        }
        removeExistingFile() {
            if (!this.hasExistingFile()) {
                return;
            }
            this.existingFileNameInput.removeClass("file-target").attr("disabled", "true").off();
        }
        onDeleteButtonClicked() {
            this.deleteButton.hide();
            this.actionInput.val("Removed");
            this.setValidationValue("");
            this.progressBar.width(0);
            this.input.filestyle("clear");
            this.removeExistingFile();
            this.tempFileIdInput.val("");
        }
        onDragDropped(e, data) {
            if (this.filenameInput.length > 0 && data.files.length > 0) {
                this.filenameInput.val(data.files.map((x) => x.name));
            }
        }
        onProgressAll(e, data) {
            const progress = parseInt((data.loaded / data.total * 100).toString(), 10);
            this.progressBar.width(progress + "%");
        }
        onUploadSuccess(response) {
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
        }
        onUploadCompleted(response) {
            const id = response.responseJSON.Result.ID;
            const filename = response.responseJSON.Result.Name;
            this.UploadCompleted({
                url: this.url.makeAbsolute(undefined, `/temp-file/${id}`),
                id,
                filename,
            });
        }
        UploadCompleted(args) {
            crossDomainEvent_3.default.raise(parent, "file-uploaded", args);
        }
        onChange(e, data) {
            this.progressBar.width(0);
            this.removeExistingFile();
        }
        setValidationValue(value) {
            this.validationInput.val(value);
            this.input.closest("form").validate().element(this.validationInput);
        }
    }
    exports.default = FileUpload;
    class FileUploadS3 extends FileUpload {
        constructor(input, url, serverInvoker, bucketUrl) {
            super(input, url, serverInvoker);
            this.bucketUrl = bucketUrl;
            this.add = (e, snedData) => {
                const file = snedData.files[0]; // (e.target as HTMLInputElement).files[0];
                const id = this.uuidv4();
                const key = `${id}/${file.name}`;
                const data = new FormData();
                data.append("key", key);
                data.append("acl", "public-read");
                data.append("file", file, file.name);
                $.ajax({
                    url: this.bucketUrl,
                    type: "POST",
                    processData: false,
                    contentType: false,
                    data,
                    success: () => {
                        if (this.input.is("[multiple]")) {
                            this.tempFileIdInput.val(this.tempFileIdInput.val() + "|" + id);
                            this.filenameInput.val(this.filenameInput.val() + ", " + file.name);
                        }
                        else {
                            this.tempFileIdInput.val(id);
                            this.filenameInput.val(file.name);
                        }
                        this.onUploadCompleted({
                            id,
                            filename: file.name,
                        });
                        this.deleteButton.show();
                        this.setValidationValue("value");
                    },
                    error: (jqXhr, _, message) => {
                        this.serverInvoker.onAjaxResponseError(jqXhr, "error", message);
                        this.filenameInput.val("");
                    },
                    xhr: () => {
                        const xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventListener("progress", (evt) => {
                            if (evt.lengthComputable) {
                                this.onProgressAll(undefined, evt);
                            }
                        }, false);
                        return xhr;
                    },
                });
            };
            this.uuidv4 = () => {
                return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                    // tslint:disable-next-line: no-bitwise
                    const r = Math.random() * 16 | 0;
                    // tslint:disable-next-line: no-bitwise
                    const v = c === "x" ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
        }
        getDataUrlAttribute() {
            return undefined;
        }
        getFileuploadOptions() {
            return $.extend({
                add: this.add,
            }, super.getFileuploadOptions());
        }
        onUploadCompleted({ id, filename }) {
            const url = `${this.bucketUrl}${id}/${filename}`;
            this.UploadCompleted({ id, filename, url });
        }
    }
    exports.FileUploadS3 = FileUploadS3;
});
define("olive/plugins/confirmBox", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfirmBox = void 0;
    class ConfirmBoxFactory {
        enable(selector) { selector.each((i, e) => new ConfirmBox($(e)).enable()); }
    }
    exports.default = ConfirmBoxFactory;
    class ConfirmBox {
        constructor(button) {
            this.button = button;
        }
        enable() {
            this.button.off("click.confirm-question").bindFirst("click.confirm-question", e => {
                e.stopImmediatePropagation();
                this.setButtonsLabel(this.button.attr('data-confirm-ok') || 'OK', this.button.attr('data-confirm-cancel') || 'Cancel');
                this.showConfirm(this.button.attr('data-confirm-question'), () => {
                    this.button.off("click.confirm-question");
                    this.button.trigger('click');
                    this.enable();
                });
                return false;
            });
        }
        setButtonsLabel(ok, cancel) {
            alertify.set({ labels: { ok, cancel } });
        }
        showConfirm(text, yesCallback) {
            alertify.confirm(text.replace(/\r/g, "<br />"), e => {
                if (e)
                    yesCallback();
                else
                    return false;
            });
        }
    }
    exports.ConfirmBox = ConfirmBox;
});
define("olive/plugins/subMenu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SubMenu {
        static enable(selector) { selector.each((i, e) => new SubMenu($(e))); }
        static createAccordion(selector) {
            selector.find('[data-toggle]').click((event) => {
                $($(event.target).parent('li').siblings().children('[data-toggle][aria-expanded=true]')).trigger('click');
            });
        }
        constructor(targetMenue) {
            this.menu = targetMenue;
            this.submenuOptions = { showTimeout: 0, hideTimeout: 0 };
            if (!!this.menu.attr('data-smartmenus-id'))
                return; // Already enabled
            this.menu.addClass("sm");
            if (this.menu.is(".nav-stacked.dropped-submenu"))
                this.menu.addClass("sm-vertical");
            let options = this.menu.attr("data-submenu-options");
            if (options)
                this.submenuOptions = JSON.safeParse(options);
            this.menu.smartmenus(this.submenuOptions);
        }
    }
    exports.default = SubMenu;
});
define("olive/plugins/instantSearch", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InstantSearch {
        static enable(selector) { selector.each((i, e) => new InstantSearch($(e)).enable()); }
        constructor(input) {
            this.input = input;
        }
        enable() {
            // TODO: Make it work with List render mode too.
            this.input.off("keyup.immediate-filter").on("keyup.immediate-filter", this.onChanged);
            this.input.on("keydown", e => {
                if (e.keyCode == 13)
                    e.preventDefault();
            });
        }
        onChanged(event) {
            this.input = this.input || $(event.currentTarget);
            let keywords = this.input.val().toLowerCase().split(' ');
            let rows = this.input.closest('[data-module]').find(".grid > tbody > tr, .olive-instant-search-item");
            rows.each((index, e) => {
                let row = $(e);
                let content = row.text().toLowerCase();
                let hasAllKeywords = keywords.filter((i) => content.indexOf(i) == -1).length == 0;
                if (hasAllKeywords)
                    row.show();
                else
                    row.hide();
            });
        }
    }
    exports.default = InstantSearch;
});
define("olive/plugins/dateDropdown", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DateDropdown {
        static enable(selector) { selector.each((i, e) => new DateDropdown($(e)).enable()); }
        constructor(input) {
            this.input = input;
        }
        enable() {
            this.input.combodate({
                format: 'DD/MM/YYYY',
                template: 'DD / MMM / YYYY',
                minYear: 1985,
                maxYear: parseInt(moment().format('YYYY')),
                smartDays: true,
                firstItem: 'name'
            });
        }
    }
    exports.default = DateDropdown;
});
define("olive/plugins/userHelp", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UserHelp {
        static enable(selector) { selector.each((i, e) => new UserHelp($(e))); }
        constructor(element) {
            element.click(() => false);
            let message = element.attr('data-user-help');
            element['popover']({ trigger: 'focus', content: message, html: true });
            var inputsibling = element.parent().prev('[type=text]');
            if (inputsibling != undefined && inputsibling != null && inputsibling.length > 0)
                inputsibling['popover']({ trigger: 'focus', content: message, html: true, placement: 'top' });
        }
    }
    exports.default = UserHelp;
});
define("olive/plugins/multiSelect", ["require", "exports", "bootstrap-select"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MultiSelectFactory = void 0;
    class MultiSelectFactory {
        constructor(modalHelper) {
            this.modalHelper = modalHelper;
        }
        enable(selector) { selector.each((i, e) => new MultiSelect($(e), this.modalHelper).show()); }
    }
    exports.MultiSelectFactory = MultiSelectFactory;
    class MultiSelect {
        //https://developer.snapappointments.com/bootstrap-select/
        constructor(selectControl, modalHelper) {
            this.selectControl = selectControl;
            this.modalHelper = modalHelper;
            if ($.fn.selectpicker)
                $.fn.selectpicker.Constructor.BootstrapVersion = "4";
        }
        show() {
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
            const options = {
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
        }
        MoveActionButtons() {
            //var actionbuttons = $(".bs-actionsbox");
            //if (actionbuttons != undefined && actionbuttons != null)
            //    actionbuttons.parent().prepend($(".bs-actionsbox"));
        }
    }
    exports.default = MultiSelect;
});
define("olive/plugins/customCheckbox", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CustomCheckbox {
        static enable(selector) {
            selector.each((i, e) => {
                if (!$(e).hasClass(this.handledClassName))
                    new CustomCheckbox($(e)).enable();
            });
        }
        constructor(input) {
            this.input = input;
        }
        enable() {
            let checkBox = $('<div class="checkbox-helper"/>');
            let toggle = () => {
                if (this.input.attr('disabled'))
                    return;
                this.input.prop('checked', !this.input.is(':checked')).focus();
                this.input.trigger('change');
            };
            checkBox.click(toggle);
            this.input.after(checkBox);
            this.input.addClass(CustomCheckbox.handledClassName);
        }
    }
    CustomCheckbox.handledClassName = 'handled';
    exports.default = CustomCheckbox;
});
define("olive/plugins/customRadio", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CustomRadio {
        static enable(selector) {
            selector.each((i, e) => {
                if (!$(e).hasClass(this.handledClassName))
                    new CustomRadio($(e)).enable();
            });
        }
        constructor(input) {
            this.input = input;
        }
        enable() {
            let radio = $('<div class="radio-helper"/>');
            let check = () => {
                if (this.input.attr('disabled'))
                    return;
                this.input.prop('checked', true).focus();
                this.input.trigger('change');
            };
            radio.click(check);
            this.input.after(radio);
            this.input.addClass(CustomRadio.handledClassName);
        }
    }
    CustomRadio.handledClassName = 'handled';
    exports.default = CustomRadio;
});
define("olive/plugins/ckEditorFileManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CKEditorFileManagerFactory = void 0;
    class CKEditorFileManagerFactory {
        constructor(url) {
            this.url = url;
        }
        enable(selector) { selector.each((i, e) => new CKEditorFileManager($(e), this.url).enable()); }
    }
    exports.CKEditorFileManagerFactory = CKEditorFileManagerFactory;
    class CKEditorFileManager {
        constructor(item, url) {
            this.item = item;
            this.url = url;
        }
        enable() {
            this.item.on('click', () => {
                const uri = this.item.data('download-uri');
                window.opener["CKEDITOR"].tools.callFunction(this.url.getQuery('CKEditorFuncNum'), uri);
                window.close();
            });
        }
    }
    exports.default = CKEditorFileManager;
});
define("olive/components/grouping", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GroupingFactory = void 0;
    class GroupingFactory {
        constructor(url, ajaxRedirect) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
        }
        enable(selector) { selector.each((_, elem) => new Grouping($(elem), this.url, this.ajaxRedirect)); }
    }
    exports.GroupingFactory = GroupingFactory;
    class Grouping {
        constructor(dropdown, url, ajaxRedirect) {
            this.dropdown = dropdown;
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            dropdown.on('change', () => {
                this.ajaxRedirect.go(this.url.updateQuery(this.url.current(), "GroupBy", dropdown.val()), dropdown, false, true, false);
            });
        }
    }
    exports.default = Grouping;
});
define("olive/di/serviceDescription", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceDescription = void 0;
    class ServiceDescription {
        constructor(key, singleton, container) {
            this.key = key;
            this.singleton = singleton;
            this.container = container;
            this.factory = () => { throw new Error(`factory is not provided for type '${this.key}'.`); };
            this.dependencies = new Array();
            this.addDependency = (dep) => {
                this.dependencies.push(dep);
                return this;
            };
            this.addDependencies = (...deps) => {
                deps.forEach(dep => {
                    this.addDependency(dep);
                });
                return this;
            };
            this.getInstance = () => {
                if (this.singleton) {
                    if (!this.instance) {
                        this.instance = this.createInstance();
                    }
                    return this.instance;
                }
                else {
                    return this.createInstance();
                }
            };
            this.createInstance = () => {
                const deps = this.dependencies.map(k => this.container.getService(k));
                return this.factory.apply({}, deps);
            };
        }
        setFactory(factory) {
            this.factory = factory;
            return this;
        }
        withDependencies(...deps) {
            this.dependencies = new Array();
            deps.forEach(dep => {
                this.addDependency(dep);
            });
            return this;
        }
    }
    exports.ServiceDescription = ServiceDescription;
});
define("olive/di/serviceContainer", ["require", "exports", "olive/di/serviceDescription"], function (require, exports, serviceDescription_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ServiceContainer = void 0;
    class ServiceContainer {
        constructor() {
            this.services = new Array();
        }
        tryAddSingleton(key, factory, serviceOut) {
            return this.try(key, serviceOut, () => this.addSingleton(key, factory));
        }
        tryAddTransient(key, factory, serviceOut) {
            return this.try(key, serviceOut, () => this.addTransient(key, factory));
        }
        addSingleton(key, factory) {
            return this.add(key, true, factory);
        }
        ;
        addTransient(key, factory) {
            return this.add(key, false, factory);
        }
        getService(key) {
            const service = this.services.filter(x => x.key === key)[0];
            if (!!service)
                return service.getInstance();
            else
                throw new Error(`No service registered for '${key}'.`);
        }
        try(key, serviceOut, action) {
            if (this.services.some(s => s.key === key)) {
                serviceOut.value = this.services.filter(x => x.key === key)[0];
                return false;
            }
            serviceOut.value = action();
            return true;
        }
        add(key, singleton, factory) {
            if (this.services.some(s => s.key === key))
                throw new Error(`A service with the same key (${key}) is already added`);
            var result = new serviceDescription_1.ServiceDescription(key, singleton, this);
            result.setFactory(factory);
            this.services.push(result);
            return result;
        }
    }
    exports.ServiceContainer = ServiceContainer;
});
define("olive/di/services", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Services = {
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
        MainTag: "mainTag",
        MainTagHelper: "mainTagHelper",
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
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SanityAdapter {
        enable() { $(window).off('click.SanityAdapter').on('click.SanityAdapter', e => this.skipNewWindows(e)); }
        skipNewWindows(element) {
            $(element.target).filter('a').removeAttr('target');
            window["open"] = (url, target, features) => { location.replace(url); return window; };
        }
    }
    exports.default = SanityAdapter;
});
define("olive/plugins/testingContext", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestingContext {
        constructor(ajaxRedirect, modalHelper, serverInvoker) {
            this.ajaxRedirect = ajaxRedirect;
            this.modalHelper = modalHelper;
            this.serverInvoker = serverInvoker;
            this.isLoaded = false;
        }
        isAjaxRedirecting() {
            return this.ajaxRedirect.isAjaxRedirecting;
        }
        isOpeningModal() {
            var _a;
            return !!((_a = this.modalHelper.currentModal) === null || _a === void 0 ? void 0 : _a.isOpening);
        }
        isClosingModal() {
            return this.modalHelper.isClosingModal;
        }
        isAwaitingAjaxResponse() {
            return this.serverInvoker.isAwaitingAjaxResponse;
        }
        isOliveMvcLoaded() {
            return this.isLoaded;
        }
        onPageInitialized() {
            this.isLoaded = true;
        }
    }
    exports.default = TestingContext;
});
define("olive/olivePage", ["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/responseProcessor", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/mvc/serverInvoker", "olive/mvc/windowEx", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "olive/plugins/multiSelect", "olive/plugins/customCheckbox", "olive/plugins/customRadio", "olive/plugins/ckEditorFileManager", "olive/components/grouping", "olive/di/serviceContainer", "olive/di/services", "olive/plugins/sanityAdapter", "olive/plugins/testingContext", "olive/components/mainTag"], function (require, exports, config_8, crossDomainEvent_4, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1, sanityAdapter_1, testingContext_1, mainTag_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OlivePage {
        constructor() {
            this.initializeActions = [];
            this.preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            this.modal = this.getService(services_1.default.ModalHelper);
            this.waiting = this.getService(services_1.default.Waiting);
            this.mainTag = this.getService(services_1.default.MainTagHelper);
            window.testingContext = this.getService(services_1.default.TestingContext);
            this.initializeServices();
            // ASP.NET needs this config for Request.IsAjaxRequest()
            $.ajaxSetup({
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            $(() => {
                // $.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS,
                //      { backdrop: this.DEFAULT_MODAL_BACKDROP });
                // $.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                this.getService(services_1.default.Alert).enableAlert();
                this.getService(services_1.default.Validate).configure();
                this.onViewChanged(null, null, true, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            this.getService(services_1.default.ResponseProcessor)
                .viewChanged.handle((x) => this.onViewChanged(x.container, x.trigger, x.isNewPage));
            crossDomainEvent_4.default.handle("refresh-page", (x) => this.refresh());
        }
        initializeServices() {
            this.modal.initialize();
            this.mainTag.initialize();
            this.getService(services_1.default.StandardAction).initialize();
            this.getService(services_1.default.Validate).initialize();
            this.getService(services_1.default.MasterDetail).initialize();
        }
        configureServices(services) {
            const out = {};
            services.tryAddSingleton(services_1.default.ServiceLocator, () => this, out);
            services.tryAddSingleton(services_1.default.ConfirmBoxFactory, () => new confirmBox_1.default(), out);
            services.tryAddSingleton(services_1.default.Alert, () => new alert_1.default(), out);
            services.tryAddSingleton(services_1.default.Url, () => new url_1.default(), out);
            services.tryAddSingleton(services_1.default.Grid, () => new grid_1.default(), out);
            services.tryAddSingleton(services_1.default.Select, () => new select_1.default(), out);
            services.tryAddSingleton(services_1.default.ResponseProcessor, () => new responseProcessor_1.default(), out);
            services.tryAddSingleton(services_1.default.SanityAdapter, () => new sanityAdapter_1.default(), out);
            if (services.tryAddSingleton(services_1.default.Waiting, (url) => new waiting_1.default(url), out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.GlobalSearchFactory, (waiting) => new globalSearch_1.GlobalSearchFactory(waiting, this.getService(services_1.default.ModalHelper)), out)) {
                out.value.withDependencies(services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.CKEditorFileManagerFactory, (url) => new ckEditorFileManager_1.CKEditorFileManagerFactory(url), out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.Sorting, (url, serverInvoker) => new sorting_1.default(url, serverInvoker), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.Paging, (url, serverInvoker) => new paging_1.default(url, serverInvoker), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.FileUploadFactory, (url, serverInvoker) => new fileUpload_1.FileUploadFactory(url, serverInvoker), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.GroupingFactory, (url, ajaxRedirect) => new grouping_1.GroupingFactory(url, ajaxRedirect), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.ModalHelper, (url, ajaxRedirect, responseProcessor) => new modal_1.ModalHelper(url, ajaxRedirect, responseProcessor), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.MainTagHelper, (url, ajaxRedirect, responseProcessor) => new mainTag_1.MainTagHelper(url, ajaxRedirect, responseProcessor), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.WindowEx, (modalHelper, ajaxRedirect) => new windowEx_1.default(modalHelper, ajaxRedirect), out)) {
                out.value.withDependencies(services_1.default.ModalHelper, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.AutoCompleteFactory, (url, form, serverInvoker) => new autoComplete_1.AutoCompleteFactory(url, form, serverInvoker), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Form, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.SliderFactory, (form) => new slider_1.SliderFactory(form), out)) {
                out.value.withDependencies(services_1.default.Form);
            }
            if (services.tryAddSingleton(services_1.default.HtmlEditorFactory, (modalHelper) => new htmlEditor_1.HtmlEditorFactory(modalHelper), out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DateTimePickerFactory, (modalHelper) => new dateTimePicker_1.DateTimePickerFactory(modalHelper), out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DatePickerFactory, (modalHelper) => new datePicker_1.DatePickerFactory(modalHelper), out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.MultiSelectFactory, (modalHelper) => new multiSelect_1.MultiSelectFactory(modalHelper), out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.TimeControlFactory, (modalHelper) => new timeControl_1.TimeControlFactory(modalHelper), out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.AjaxRedirect, (url, responseProcessor, waiting) => new ajaxRedirect_1.default(url, responseProcessor, waiting), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ResponseProcessor, services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.Form, (url, validate, waiting, ajaxRedirect) => new form_1.default(url, validate, waiting, ajaxRedirect), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.Validate, (alert, responseProcessor) => new validate_1.default(alert, responseProcessor), out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.MasterDetail, (validate, responseProcessor) => new masterDetail_1.default(validate, responseProcessor), out)) {
                out.value.withDependencies(services_1.default.Validate, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.TestingContext, (ajaxRedirect, modalHelper, serverInvoker) => new testingContext_1.default(ajaxRedirect, modalHelper, serverInvoker), out)) {
                out.value.withDependencies(services_1.default.AjaxRedirect, services_1.default.ModalHelper, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.StandardAction, (alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, mainTagHelper, serviceLocator) => new standardAction_1.default(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, mainTagHelper, serviceLocator), out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.Form, services_1.default.Waiting, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor, services_1.default.Select, services_1.default.ModalHelper, services_1.default.ServiceLocator);
            }
            if (services.tryAddSingleton(services_1.default.ServerInvoker, (url, validate, waiting, form, responseProcessor) => new serverInvoker_1.default(url, validate, waiting, form, responseProcessor), out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.Form, services_1.default.ResponseProcessor);
            }
        }
        fixAlertIssues() {
            if (!$.fn.tooltip.Constructor) {
                $.fn.tooltip.Constructor = {};
            }
            window.alertify = window.require("alertify")();
        }
        onInit(action) { this.initializeActions.push(action); }
        onPreInit(action) { this.preInitializeActions.push(action); }
        onViewChanged(container = null, trigger = null, newPage = false, firstTime = false) {
            const standardAction = this.getService(services_1.default.StandardAction);
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
        }
        initialize() {
            this.preInitializeActions.forEach((action) => action());
            // =================== Standard Features ====================
            const grid = this.getService(services_1.default.Grid);
            grid.mergeActionButtons();
            grid.enableColumn($(".select-cols .apply"));
            grid.enableSelectCol($(".select-grid-cols .group-control"));
            grid.enableToggle($("th.select-all > input:checkbox"));
            this.getService(services_1.default.MasterDetail).enable($("[data-delete-subform]"));
            const paging = this.getService(services_1.default.Paging);
            paging.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
            const sorting = this.getService(services_1.default.Sorting);
            sorting.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
            paging.enableWithAjax($("a[data-pagination]"));
            sorting.enableAjaxSorting($("a[data-sort]"));
            sorting.setSortHeaderClass($("th[data-sort]"));
            const form = this.getService(services_1.default.Form);
            this.enablecleanUpNumberField(form);
            this.modal.enableEnsureHeight($("[data-toggle=tab]"));
            //this.getService<MultiSelect>(Services.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
            this.getService(services_1.default.Select)
                .enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_1.default.ModalHelper).enableLink($("[target='$modal'][href]"));
            this.getService(services_1.default.MainTagHelper).enableLink($("[target^='$']:not([target = '$modal'])[href]"));
            this.getService(services_1.default.GroupingFactory).enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", (e) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));
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
            const formAction = this.getService(services_1.default.ServerInvoker);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_1.default.MasterDetail).updateSubFormStates();
            this.modal.adjustHeight();
            this.initializeActions.forEach((action) => action());
            $(this).trigger("initialized");
            window.testingContext.onPageInitialized();
            try {
                $.validator.unobtrusive.parse("form");
            }
            catch (error) {
                console.error(error);
            }
        }
        enableCustomCheckbox() {
            const all = $("input[type=checkbox]");
            const shouldSkip = $(".as-buttons-input input[type=checkbox]");
            customCheckbox_1.default.enable(all.not(shouldSkip));
        }
        enablecleanUpNumberField(form) {
            form.enablecleanUpNumberField($("[data-val-number]"));
        }
        enableCustomRadio() {
            const all = $("input[type=radio]");
            const shouldSkip = $(".as-buttons-input input[type=radio]");
            customRadio_1.default.enable(all.not(shouldSkip));
        }
        goBack(target) {
            const url = this.getService(services_1.default.Url);
            var returnUrl = url.getQuery("ReturnUrl");
            returnUrl = url.decodeGzipUrl(returnUrl);
            if (returnUrl && target && $(target).is("[data-redirect=ajax]")) {
                const link = $(target);
                let ajaxTarget = link.attr("ajax-target");
                let ajaxhref = link.attr("href");
                this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true, undefined, ajaxTarget, ajaxhref);
            }
            else {
                url.goBack(target);
            }
            return false;
        }
        customizeValidationTooltip() { }
        refresh(keepScroll = false) {
            // if ($("main").length === 1 || $("main").length === 2) {
            //     // if there is an ajax modal available, then we have 2 main elements.
            //     this.getService<AjaxRedirect>(Services.AjaxRedirect)
            //         .go(location.href, null, false /*isBack*/, keepScroll, false);
            // } else {
            //     location.reload();
            // }
            location.reload();
            return false;
        }
        getService(key) {
            return this.services.getService(key);
        }
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiLCIuLi9zcmMvY29tcG9uZW50cy9saXRlRXZlbnQudHMiLCIuLi9zcmMvbXZjL3Jlc3BvbnNlUHJvY2Vzc29yLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvdXJsLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvd2FpdGluZy50cyIsIi4uL3NyYy9tdmMvYWpheFJlZGlyZWN0LnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvYWxlcnQudHMiLCIuLi9zcmMvcGx1Z2lucy9zZWxlY3QudHMiLCIuLi9zcmMvY29tcG9uZW50cy9tb2RhbC50cyIsIi4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiLCIuLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiLCIuLi9zcmMvbXZjL3N0YW5kYXJkQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9zZXJ2ZXJJbnZva2VyLnRzIiwiLi4vc3JjL212Yy93aW5kb3dFeC50cyIsIi4uL3NyYy9leHRlbnNpb25zL2pRdWVyeUV4dGVuc2lvbnMudHMiLCIuLi9zcmMvZXh0ZW5zaW9ucy9zeXN0ZW1FeHRlbnNpb25zLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvc29ydGluZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL3BhZ2luZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL21hc3RlckRldGFpbC50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyaWQudHMiLCIuLi9zcmMvcGx1Z2lucy9wYXNzd29yZFN0ZW5ndGgudHMiLCIuLi9zcmMvcGx1Z2lucy9odG1sRWRpdG9yLnRzIiwiLi4vc3JjL3BsdWdpbnMvdGltZUNvbnRyb2wudHMiLCIuLi9zcmMvcGx1Z2lucy9hdXRvQ29tcGxldGUudHMiLCIuLi9zcmMvcGx1Z2lucy9nbG9iYWxTZWFyY2gudHMiLCIuLi9zcmMvcGx1Z2lucy9zbGlkZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlckJhc2UudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlUGlja2VyLnRzIiwiLi4vc3JjL3BsdWdpbnMvZGF0ZVRpbWVQaWNrZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9udW1lcmljVXBEb3duLnRzIiwiLi4vc3JjL3BsdWdpbnMvZmlsZVVwbG9hZC50cyIsIi4uL3NyYy9wbHVnaW5zL2NvbmZpcm1Cb3gudHMiLCIuLi9zcmMvcGx1Z2lucy9zdWJNZW51LnRzIiwiLi4vc3JjL3BsdWdpbnMvaW5zdGFudFNlYXJjaC50cyIsIi4uL3NyYy9wbHVnaW5zL2RhdGVEcm9wZG93bi50cyIsIi4uL3NyYy9wbHVnaW5zL3VzZXJIZWxwLnRzIiwiLi4vc3JjL3BsdWdpbnMvbXVsdGlTZWxlY3QudHMiLCIuLi9zcmMvcGx1Z2lucy9jdXN0b21DaGVja2JveC50cyIsIi4uL3NyYy9wbHVnaW5zL2N1c3RvbVJhZGlvLnRzIiwiLi4vc3JjL3BsdWdpbnMvY2tFZGl0b3JGaWxlTWFuYWdlci50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyb3VwaW5nLnRzIiwiLi4vc3JjL2RpL3NlcnZpY2VEZXNjcmlwdGlvbi50cyIsIi4uL3NyYy9kaS9zZXJ2aWNlQ29udGFpbmVyLnRzIiwiLi4vc3JjL2RpL3NlcnZpY2VzLnRzIiwiLi4vc3JjL3BsdWdpbnMvc2FuaXR5QWRhcHRlci50cyIsIi4uL3NyYy9wbHVnaW5zL3Rlc3RpbmdDb250ZXh0LnRzIiwiLi4vc3JjL29saXZlUGFnZS50cyIsIi4uL3NyYy9kaS9JU2VydmljZS50cyIsIi4uL3NyYy9kaS9pU2VydmljZUxvY2F0b3IudHMiLCIuLi9zcmMvZGkvb3V0UGFyYW0udHMiLCIuLi9zcmMvbXZjL2NvbWJpbmVkVXRpbGl0aWVzLnRzIiwiLi4vc3JjL212Yy9mb3JtQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9pSW52b2NhdGlvbkNvbnRleHQudHMiLCIuLi9zcmMvbXZjL2ludGVy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