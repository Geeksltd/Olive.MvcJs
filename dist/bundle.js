define("config", ["require", "exports"], function (require, exports) {
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
    // CKEditor configuration - supports both v4 and v5
    Config.CK_EDITOR_BASE_PATH = '/lib/ckeditor/';
    Config.CK_EDITOR_VERSION = 'auto'; // 'auto', '4', or '5'
    Config.CK_EDITOR_5_BUNDLE = 'classic'; // 'classic', 'decoupled', 'inline', 'balloon', 'balloon-block'
    Config.CK_EDITOR_5_USE_CDN = true; // Use local build via RequireJS compatibility
    // CKEditor 5 specific settings
    Config.CK_EDITOR_5_CONFIG = {
        language: 'en',
        placeholder: 'Enter your content...',
        // Add more CKEditor 5 specific configurations here
    };
    exports.default = Config;
});
define("components/crossDomainEvent", ["require", "exports"], function (require, exports) {
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
define("components/liteEvent", ["require", "exports"], function (require, exports) {
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
define("mvc/responseProcessor", ["require", "exports", "components/liteEvent"], function (require, exports, liteEvent_1) {
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
            let targetMainName = trigger.attr("target");
            if (!targetMainName) {
                targetMainName = trigger.closest("main").attr("name");
            }
            this.processWithTheContentInternal(targetMainName, trigger, newMain, args, referencedScripts);
        }
        processWithTheContentInternal(targetMainName, trigger, newMain, args, referencedScripts) {
            const width = $(window).width();
            const mobileBreakpoint = 800;
            let oldMain = targetMainName === null || targetMainName === undefined
                ? trigger.closest("main")
                : $("main[name='" + targetMainName + "']");
            if (oldMain.length === 0)
                oldMain = $("main:first");
            if (oldMain.length === 0)
                console.error("There is no <main> object with the name of '" + targetMainName + "'.");
            if (oldMain != undefined && oldMain != null && oldMain.length > 0) {
                const mainName = oldMain[0].className;
                if (mainName != undefined && mainName != null && mainName.length > 0) {
                    let validNode = false;
                    const SimilarNodes = document.getElementsByTagName("MAIN");
                    for (var i = 0; i < SimilarNodes.length; ++i) {
                        const SimilarNode = SimilarNodes[i];
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
            const tooltips = $('body > .tooltip');
            tooltips.each((_index, elem) => {
                if ($('[aria-discribedby=' + elem.id + ']'))
                    elem.remove();
            });
            var attributes = oldMain.prop("attributes");
            $.each(attributes, function () {
                if (this.name.indexOf("data-") !== 0)
                    return;
                newMain.attr(this.name, this.value);
            });
            let enterClass = undefined;
            let exitClass = undefined;
            let transition = oldMain.attr("data-transition");
            transition = trigger.attr("data-transition") || transition;
            // backward compatibility
            // if (transition == "slide") transition = "slide-mobile";
            const isValid = !!transition
                && (!transition.endsWith("-mobile") || width <= mobileBreakpoint)
                && (!transition.endsWith("-desktop") || width > mobileBreakpoint);
            if (!isValid) {
                this.replaceContent(referencedScripts, trigger, newMain, oldMain, enterClass, exitClass);
                return;
            }
            const back = args === "back";
            transition = transition
                .replace("-mobile", "")
                .replace("-desktop", "")
                .replace("-both", "");
            switch (transition) {
                case "slide":
                    enterClass = back ? "w3-animate-left" : "w3-animate-right";
                    exitClass = back ? "w3-animate-righter" : "w3-animate-lefter";
                    break;
                case "fade":
                    enterClass = "w3-fade-in";
                    exitClass = "w3-fade-out";
                    break;
                default:
                    console.error(`transition '${transition}' not defined.`);
                    break;
            }
            this.replaceContent(referencedScripts, trigger, newMain, oldMain, enterClass, exitClass);
        }
        replaceContent(referencedScripts, trigger, newMain, oldMain, enterClass, exitClass) {
            var update = () => {
                oldMain.replaceWith(newMain);
                if (enterClass)
                    newMain.addClass(enterClass);
                this.updateUrl(referencedScripts, newMain, trigger);
            };
            if (exitClass) {
                oldMain.addClass(exitClass);
                setTimeout(() => {
                    update();
                }, 200);
            }
            else {
                update();
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
define("components/url", ["require", "exports", "pako/dist/pako"], function (require, exports, pako) {
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
            const returnUrl = this.encodeGzipUrl("/" + this.makeRelative(url).trimStart("/"));
            window.location.href = "/login?returnUrl=" + returnUrl;
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
define("components/waiting", ["require", "exports"], function (require, exports) {
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
define("components/mainTag", ["require", "exports", "components/liteEvent"], function (require, exports, liteEvent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainTagHelper = void 0;
    class MainTagHelper {
        constructor(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.state = undefined;
            this.onUrlChanged = new liteEvent_2.default();
            this.validateState = () => {
                if (!this.state || this.state.url != window.location.pathname) {
                    this.state = { url: window.location.pathname, foundQs: [] };
                }
            };
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
            this.responseProcessor.processCompleted.handle((e) => {
                this.tryOpenFromUrl();
            });
        }
        resetState() {
            this.state = undefined;
        }
        tryOpenFromUrl() {
            this.validateState();
            this.tryOpenFromUrlInternal();
            this.tryOpenDefaultUrl();
        }
        tryOpenFromUrlInternal() {
            var reserved = ["_modal", "_nav"];
            // at least one content loaded
            let result = false;
            new URLSearchParams(window.location.search).forEach((value, key) => {
                if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                    const mainTagName = key.substring(1);
                    if (this.state.foundQs.indexOf(mainTagName) !== -1)
                        return;
                    if (this.openWithUrl(mainTagName)) {
                        this.state.foundQs.push(mainTagName);
                        result = true;
                    }
                }
            });
            return result;
        }
        tryOpenDefaultUrl() {
            var tags = $("main[name^='$'][data-default-url], main[name^='$'][data-current-url]");
            // at least one content loaded
            let result = false;
            for (let i = 0; i < tags.length; i++) {
                const main = $(tags[i]);
                const mainTagName = main.attr("name").substring(1);
                if (this.state.foundQs.indexOf(mainTagName) !== -1)
                    continue;
                // try read from data-current-url, if unavailable read from data-default-url
                const url = main.attr("data-current-url") || main.attr("data-default-url");
                main.attr("data-default-url", undefined);
                if (url && this.openWithUrl(mainTagName, url)) {
                    this.state.foundQs.push(mainTagName);
                    result = true;
                }
            }
            return result;
        }
        removeFromUrl(mainTagName) {
            mainTagName = mainTagName.replace("$", "");
            let currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            if (currentPath !== this.url.current()) {
                history.replaceState({}, document.title, currentPath);
            }
        }
        changeUrl(url, mainTagName, title) {
            this.validateState();
            mainTagName = mainTagName.replace("$", "");
            const element = $("main[name='$" + mainTagName + "']");
            element.attr('data-current-url', url);
            const encodedUrl = this.url.encodeGzipUrl(url);
            const skipUrlParameter = element.attr("data-change-url") === "false";
            if (skipUrlParameter) {
                this.removeFromUrl(mainTagName);
                this.onUrlChanged.raise({ mainTagName, url, encodedUrl, addedToUrl: false });
                return;
            }
            let currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            var children = element.attr("data-children");
            if (children) {
                children.split(",").forEach(child => {
                    if (child.startsWith("$")) {
                        child = child.substring(1);
                    }
                    currentPath = this.url.removeQuery(currentPath, "_" + child);
                    this.state.foundQs = this.state.foundQs.filter(item => item !== child);
                });
            }
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            let mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, encodedUrl);
            history.pushState({}, title, mainTagUrl);
            this.onUrlChanged.raise({ mainTagName, url, encodedUrl, addedToUrl: true });
        }
        invalidateChildren(mainTagElement) {
            const childrenStr = mainTagElement.attr("data-children");
            if (!childrenStr || !childrenStr.length)
                return;
            const children = childrenStr.split(",").filter(a => a && a.length);
            if (!children || !children.length)
                return;
            children.forEach(child => {
                if (child.startsWith("$")) {
                    child = child.substring(1);
                }
                this.state.foundQs = this.state.foundQs.filter(item => item !== child);
            });
        }
        render(event, url) {
            this.validateState();
            const target = $(event.currentTarget);
            const mainTagUrl = url ? url : target.attr("href");
            const mainTagName = target.attr("target").replace("$", "");
            const element = $("main[name='$" + mainTagName + "']");
            if (!mainTagUrl || !element || !element.length)
                return false;
            if (this.state.foundQs.indexOf(mainTagName) === -1)
                this.state.foundQs.push(mainTagName);
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, target).render();
        }
        openWithUrl(mainTagName, url) {
            this.validateState();
            mainTagName = mainTagName.replace("$", "");
            const mainTagUrl = url ? url : this.url.getQuery("_" + mainTagName);
            const element = $("main[name='$" + mainTagName + "']");
            if (!mainTagUrl || !element || !element.length)
                return false;
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
            return true;
        }
        reload(mainTagName) {
            this.validateState();
            mainTagName = mainTagName.replace("$", "");
            const element = $("main[name='$" + mainTagName + "']");
            if (!element || !element.length)
                return false;
            // Priority: 1. query string (gzipped), 2. data-current-url, 3. data-default-url
            const qsUrlEncoded = this.url.getQuery("_" + mainTagName);
            const qsUrl = qsUrlEncoded ? this.url.decodeGzipUrl(qsUrlEncoded) : null;
            const currentUrl = element.attr("data-current-url");
            const defaultUrl = element.attr("data-default-url");
            const mainTagUrl = qsUrl || currentUrl || defaultUrl;
            if (!mainTagUrl)
                return false;
            this.state.foundQs = this.state.foundQs.filter(item => item !== mainTagName);
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
            this.state.foundQs.push(mainTagName);
            return true;
        }
    }
    exports.MainTagHelper = MainTagHelper;
    class MainTag {
        constructor(urlService, ajaxRedirect, helper, baseUrl, element, mainTagName, trigger) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.element = element;
            this.mainTagName = mainTagName;
            this.trigger = trigger;
            baseUrl = this.urlService.decodeGzipUrl(baseUrl);
            if (this.isValidUrl(baseUrl)) {
                this.url = this.urlService.makeRelative(decodeURIComponent(baseUrl));
            }
            helper.invalidateChildren(element);
            element.html('');
        }
        render(changeUrl = true) {
            var _a;
            if (!this.url)
                return;
            const back = ((_a = this.trigger) === null || _a === void 0 ? void 0 : _a.attr("data-back")) === "true";
            const skipUrlParameter = this.element.attr("data-change-url") === "false";
            this.ajaxRedirect.go(this.url, this.element, back, false, false, (success) => {
                if (!success)
                    return;
                // Always update data-current-url with the loaded URL
                this.element.attr('data-current-url', this.url);
                var title = this.element.find("#page_meta_title").val();
                if (title == undefined || title == null)
                    title = $("#page_meta_title").val();
                if (changeUrl && !skipUrlParameter) {
                    this.helper.changeUrl(this.url, this.mainTagName, title);
                }
                else {
                    if (skipUrlParameter) {
                        this.helper.removeFromUrl(this.mainTagName);
                    }
                    document.title = title;
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
define("di/services", ["require", "exports"], function (require, exports) {
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
define("mvc/ajaxRedirect", ["require", "exports", "di/services", "components/liteEvent"], function (require, exports, services_1, liteEvent_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AjaxRedirect {
        constructor(url, responseProcessor, waiting) {
            this.url = url;
            this.responseProcessor = responseProcessor;
            this.waiting = waiting;
            this.requestCounter = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
            // public onRedirected: ((title: string, url: string) => void) = this.defaultOnRedirected;
            // public onRedirectionFailed: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed;
            this.beforeRedirect = new liteEvent_3.default();
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
        enableRedirect(selector) {
            selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));
        }
        onRedirected(trigger, title, url) {
            if (this.onMainTagRedirected(trigger, title, url)) {
                return;
            }
            history.pushState({}, title, url);
        }
        onMainTagRedirected(trigger, title, url) {
            // if trigger is a main tag with name starting by $ character or it has a parent with this conditions
            // we need to edit a query string parameter as _{main tag name without $}={url pathname}
            const mainTag = this.finalTargetAsMainTag(trigger);
            if (!this.isInternalMainTag(mainTag))
                return false;
            window.page.getService(services_1.default.MainTagHelper)
                .changeUrl(url, mainTag.attr("name").replace("$", ""), title);
            return true;
        }
        isInternalMainTag(mainTag) {
            if (!mainTag || !mainTag.length)
                return false;
            const name = mainTag.attr('name');
            if (!name || name.length < 1)
                return false;
            return name[0] == "$";
        }
        finalTargetAsMainTag(trigger) {
            let mainTag = trigger.is("main") ? trigger : trigger.closest("main");
            if (!!mainTag && !!mainTag.length)
                return mainTag;
            mainTag = $("main:first");
            if (!!mainTag && !!mainTag.length)
                return mainTag;
            return undefined;
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
            this.beforeRedirect.raise({});
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
            if (!trigger)
                trigger = $(window);
            var activebutton = trigger.children(".board-header").first().children(".col-md-10").first().children(".board-links").first().children(".active");
            if (ajaxTarget && (trigger.prop("tagName") != "A" && trigger.prop("tagName") != "MAIN") && (activebutton == null || activebutton == undefined || activebutton.length == 0)) {
                return;
            }
            isBack = isBack || (trigger === null || trigger === void 0 ? void 0 : trigger.attr("data-back")) === "true";
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
            const mainTag = this.finalTargetAsMainTag(trigger);
            let version = undefined;
            if (mainTag) {
                mainTag.removeClass("w3-semi-fade-in");
                mainTag.addClass("w3-semi-fade-out");
                version = this.uuidv4();
                mainTag.attr("data-version", version);
            }
            $.ajax({
                url,
                type: "GET",
                xhrFields: { withCredentials: true },
                success: (response) => {
                    if (version && mainTag) {
                        const name = mainTag.attr("name");
                        if (name && name.startsWith("$")) {
                            const currentVersion = mainTag.attr("data-version");
                            if (version != currentVersion) {
                                console.log("Version mismatch, aborting. MainTag: " + name);
                                return;
                            }
                            if (!document.contains(mainTag[0])) {
                                if (!$(`main[name='${name}']`).length) {
                                    console.log("Main tag no longer in document, aborting. MainTag: " + name);
                                    return;
                                }
                            }
                        }
                    }
                    var title = $(response).find("#page_meta_title").val();
                    if (title == undefined || title == null)
                        title = $("#page_meta_title").val();
                    if ((ajaxTarget || document.URL.contains("?$")) && (ajaxhref == undefined)) {
                        const documentUrl = document.URL;
                        const newUrl = trigger.attr("data-addressbar") || url;
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
                    else {
                        this.onMainTagRedirected(trigger, title, url);
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
                complete: (response) => {
                    this.waiting.hide();
                    if (mainTag) {
                        mainTag.removeClass("w3-semi-fade-out");
                        mainTag.addClass("w3-semi-fade-in");
                    }
                }
            });
            return false;
        }
    }
    exports.default = AjaxRedirect;
});
define("components/alert", ["require", "exports"], function (require, exports) {
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
define("plugins/select", ["require", "exports", "bootstrap-select"], function (require, exports) {
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
define("components/modal", ["require", "exports", "components/crossDomainEvent"], function (require, exports, crossDomainEvent_1) {
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
        openHtmlContent(event, modalTitle, htmlContent, options) {
            new Modal(this.url, this.ajaxRedirect, this, event, undefined, options).openHtmlContent(modalTitle, htmlContent);
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
            // if (true /* TODO: Change to if Internet Explorer only */) {
            //     this.helper.current.removeClass("fade");
            // }
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
        openHtmlContent(modalTitle, htmlContent) {
            this.isOpening = true;
            this.helper.isAjaxModal = false;
            if (this.helper.current) {
                if (this.helper.close() === false) {
                    return false;
                }
            }
            this.helper.current = $(this.getModalTemplateForHtmlContent(this.modalOptions));
            this.helper.currentModal = this;
            this.scrollPosition = $(window).scrollTop();
            if (modalTitle) {
                const title = this.helper.current.find(".modal-title");
                title.html(modalTitle);
            }
            const container = this.helper.current.find(".modal-body");
            container.html(htmlContent);
            this.isOpening = false;
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
        getModalTemplateForHtmlContent(options) {
            let modalDialogStyle = "";
            let containerStyle = "width:100%; border:0;";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + ";";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                    containerStyle += "height:" + options.height + ";";
                }
            }
            return "<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
         aria-hidden='true'>\
                    <div class='modal-dialog' style='" + modalDialogStyle + "'>\
            <div class='modal-content'>\
            <div class='modal-header'>\
                <h5 class='modal-title'></h5>\
                <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
                    <i class='fa fa-times-circle'></i>\
                </button>\
            </div>\
            <div class='modal-body' style='" + containerStyle + "'>\
            </div>\
        </div></div></div>";
        }
    }
    exports.default = Modal;
});
define("components/validate", ["require", "exports", "config"], function (require, exports, config_1) {
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
define("components/form", ["require", "exports"], function (require, exports) {
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
                button.trigger('click');
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
define("mvc/standardAction", ["require", "exports", "components/crossDomainEvent"], function (require, exports, crossDomainEvent_2) {
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
            if (action.AsModal) {
                this.openModalHtmlContent({ currentTarget: trigger }, action.Title, action.Notify);
                return;
            }
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
            else if (action.Target && action.Target.indexOf('$') === 0) {
                trigger.attr('target', action.Target);
                this.renderMainTag({ currentTarget: trigger }, action.Redirect);
            }
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
        openModalHtmlContent(event, modalTitle, htmlContent, options) {
            this.modalHelper.close();
            setTimeout(() => this.modalHelper.openHtmlContent(event, modalTitle, htmlContent, options), 0);
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
define("mvc/serverInvoker", ["require", "exports", "config"], function (require, exports, config_2) {
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
        processActionUrl(actionUrl) {
            try {
                var returnurlKey = "returnurl";
                var url = new URL(actionUrl.toLowerCase());
                var params = new URLSearchParams(url.search);
                if (params.has(returnurlKey)) {
                    var returnurl = params.get(returnurlKey);
                    returnurl = returnurl.replace(/&/g, "%26");
                    params.set(returnurlKey, returnurl);
                }
                url.search = params.toString();
                return url.toString();
            }
            catch (e) {
                console.log(e);
                return actionUrl;
            }
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
            if (actionUrl != undefined && actionUrl != null && actionUrl.toLowerCase().contains("returnurl=") && !actionUrl.toLowerCase().contains("returnurl=...")) {
                actionUrl = this.processActionUrl(actionUrl);
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
define("mvc/windowEx", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WindowEx {
        constructor(modalHelper, mainTagHelper, ajaxRedirect) {
            this.modalHelper = modalHelper;
            this.mainTagHelper = mainTagHelper;
            this.ajaxRedirect = ajaxRedirect;
        }
        enableBack(selector) {
            selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back(e));
        }
        back(event) {
            if (this.modalHelper.isOrGoingToBeModal()) {
                this.modalHelper.close();
                return;
            }
            if (this.ajaxRedirect.ajaxChangedUrl == 0)
                return;
            this.ajaxRedirect.ajaxChangedUrl--;
            const link = $(event.currentTarget);
            const thatModalHelper = this.modalHelper;
            const thatMainTagHelper = this.mainTagHelper;
            const onSuccess = success => {
                thatModalHelper.tryOpenFromUrl();
                thatMainTagHelper.resetState();
                thatMainTagHelper.tryOpenFromUrl();
            };
            if (link && link.length && link.prop("tagName") == "A") {
                let ajaxTarget = link.attr("ajax-target");
                let ajaxhref = link.attr("href");
                this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, ajaxTarget, ajaxhref);
            }
            else {
                this.ajaxRedirect.go(location.href, null, true, false, false, onSuccess, undefined, undefined);
            }
        }
    }
    exports.default = WindowEx;
});
define("extensions/jQueryExtensions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.raiseEvent = exports.enableValidateForCheckboxList = exports.enableValidateForTimePicker = void 0;
    exports.screenOffset = screenOffset;
    exports.bindFirst = bindFirst;
    exports.getUniqueSelector = getUniqueSelector;
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
    // [name] is the name of the event "click", "mouseover", .. 
    // same as you'd pass it to bind()
    // [fn] is the handler function
    function bindFirst(name, fn) {
        // Use .on() instead of deprecated .bind()
        this.on(name, fn);
        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        var jq = $;
        // Use $._data() with jQuery 3.x compatible approach
        var element = this.get(0);
        if (element) {
            var eventsData = jq._data ? jq._data(element, "events") : $(element).data("events");
            if (eventsData) {
                var handlers = eventsData[name.split('.')[0]];
                if (handlers && handlers.length > 0) {
                    // take out the handler we just inserted from the end
                    var handler = handlers.pop();
                    // move it at the beginning
                    handlers.splice(0, 0, handler);
                }
            }
        }
        return this;
    }
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
});
define("extensions/systemExtensions", ["require", "exports", "extensions/jQueryExtensions"], function (require, exports, jq) {
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
define("components/sorting", ["require", "exports", "jquery-sortable"], function (require, exports) {
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
define("components/paging", ["require", "exports"], function (require, exports) {
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
define("components/masterDetail", ["require", "exports"], function (require, exports) {
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
                const targetElement = $(e).closest("[data-module]").find("[data-add-subform=" + $(e).attr("data-subform") + "]");
                if (show) {
                    targetElement.show();
                }
                else {
                    targetElement.hide();
                }
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
define("components/grid", ["require", "exports"], function (require, exports) {
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
            container.find("a.select-cols").on('click', () => { columns.show(); return false; });
            columns.find('.cancel').on('click', () => columns.hide());
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
define("plugins/passwordStength", ["require", "exports"], function (require, exports) {
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
define("plugins/htmlEditor", ["require", "exports", "config"], function (require, exports, config_3) {
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
            // Support both CKEditor 4 and 5
            if (this.isCKEditor5()) {
                this.enableCKEditor5();
            }
            else {
                this.enableCKEditor4();
            }
        }
        isCKEditor5() {
            if (config_3.default.CK_EDITOR_VERSION === '4')
                return false;
            // Check if CKEditor 5 is available (via RequireJS or global)
            return typeof window["ClassicEditor"] !== "undefined" ||
                typeof window["DecoupledEditor"] !== "undefined" ||
                typeof window["InlineEditor"] !== "undefined" ||
                config_3.default.CK_EDITOR_5_USE_CDN;
        }
        enableCKEditor5() {
            if (config_3.default.CK_EDITOR_5_USE_CDN) {
                // Use RequireJS to load CKEditor 5 from CDN
                this.loadCKEditor5ViaRequireJS();
            }
            else {
                // Load CKEditor 5 dynamically from local files
                this.onDemandScript(config_3.default.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCKEditor5ScriptReady());
            }
        }
        enableCKEditor4() {
            // Legacy CKEditor 4 support
            window["CKEDITOR_BASEPATH"] = config_3.default.CK_EDITOR_BASE_PATH;
            this.onDemandScript(config_3.default.CK_EDITOR_BASE_PATH + "ckeditor.js", () => this.onCKEditor4ScriptReady());
        }
        loadCKEditor5ViaRequireJS() {
            // Use RequireJS to load CKEditor 5 from CDN UMD build
            if (typeof window["require"] !== "undefined") {
                const self = this;
                // Use bracket notation to bypass TypeScript strict typing for RequireJS
                window["require"](["ckeditor5"], function (ClassicEditor) {
                    if (ClassicEditor && typeof ClassicEditor.create === 'function') {
                        self.initializeCKEditor5(ClassicEditor);
                    }
                    else if (typeof window["ClassicEditor"] !== "undefined") {
                        self.initializeCKEditor5(window["ClassicEditor"]);
                    }
                    else {
                        console.error("CKEditor 5 ClassicEditor not found via RequireJS. Falling back to CKEditor 4.");
                        self.enableCKEditor4();
                    }
                });
            }
            else {
                console.error("RequireJS not available. Falling back to CKEditor 4.");
                this.enableCKEditor4();
            }
        }
        onCKEditor5ScriptReady() {
            const EditorClass = window["ClassicEditor"] || window["DecoupledEditor"] || window["InlineEditor"];
            if (!EditorClass) {
                console.error("CKEditor 5 not found. Falling back to CKEditor 4.");
                this.enableCKEditor4();
                return;
            }
            this.initializeCKEditor5(EditorClass);
        }
        initializeCKEditor5(EditorClass) {
            const element = this.input[0];
            const config = this.getCKEditor5Settings();
            EditorClass.create(element, config)
                .then((editor) => {
                this.setupCKEditor5Events(editor);
                this.modalHelper.adjustHeight();
                console.log("CKEditor 5 initialized successfully");
            })
                .catch((error) => {
                console.error("Error initializing CKEditor 5:", error);
                // Fallback to CKEditor 4
                this.enableCKEditor4();
            });
        }
        onCKEditor4ScriptReady() {
            CKEDITOR.basePath = config_3.default.CK_EDITOR_BASE_PATH;
            CKEDITOR.config.contentsCss = config_3.default.CK_EDITOR_BASE_PATH + 'contents.css';
            let editor = CKEDITOR.replace(this.input.attr('name'), this.getCKEditor4Settings());
            editor.on('change', (evt) => evt.editor.updateElement());
            editor.on("instanceReady", (event) => this.modalHelper.adjustHeight());
        }
        setupCKEditor5Events(editor) {
            editor.model.document.on('change:data', () => {
                // Update the original input element
                this.input.val(editor.getData());
            });
        }
        getCKEditor5Settings() {
            const toolbar = this.input.attr('data-toolbar') || config_3.default.DEFAULT_HTML_EDITOR_MODE;
            return {
                toolbar: this.getCKEditor5Toolbar(toolbar),
                // Add other CKEditor 5 specific configurations
                placeholder: this.input.attr('placeholder') || 'Enter your content...',
                licenseKey: "GPL"
                // Plugin configurations can be added here
            };
        }
        getCKEditor4Settings() {
            return {
                toolbar: this.input.attr('data-toolbar') || config_3.default.DEFAULT_HTML_EDITOR_MODE,
                customConfig: this.input.attr('data-config') || HtmlEditor.editorConfigPath
            };
        }
        getCKEditor5Toolbar(toolbarMode) {
            // Map toolbar modes to CKEditor 5 toolbar configurations
            const toolbarConfigs = {
                'Compact': ['bold', 'italic', 'link'],
                'Medium': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo'],
                'Advance': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'imageUpload', 'mediaEmbed', '|', 'undo', 'redo'],
                'Full': ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'outdent', 'indent', '|', 'blockQuote', 'insertTable', '|', 'imageUpload', 'mediaEmbed', '|', 'codeBlock', '|', 'undo', 'redo']
            };
            return toolbarConfigs[toolbarMode] || toolbarConfigs['Medium'];
        }
        onDemandScript(url, callback) {
            callback = (typeof callback !== "undefined") ? callback : () => { };
            if (typeof window["require"] !== "undefined") {
                window["require"]([url], callback);
                return;
            }
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
define("plugins/timeControl", ["require", "exports", "config"], function (require, exports, config_4) {
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
            input.parent().find(".fa-clock-o").parent(".input-group-addon").on('click', () => { input.focus(); });
        }
    }
    exports.default = TimeControl;
});
define("plugins/autoComplete", ["require", "exports"], function (require, exports) {
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
define("plugins/globalSearch", ["require", "exports"], function (require, exports) {
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
            this.currentAjaxRequests = [];
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
            this.input.on('keyup', (e) => {
                if (e.keyCode === 27)
                    return;
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
            for (const req of this.currentAjaxRequests) {
                req.abort();
            }
            this.currentAjaxRequests = [];
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
            if (!context.ajaxList.length) {
                this.resultsPanel.html(`<div class='global-search-no-results'>` +
                    `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                    `</div>`);
                return;
            }
            this.resultsPanel.html("<div class='global-search-loading'>Searching...</div>");
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
                this.currentAjaxRequests.push(ajaxObject.ajx);
            }
        }
        onSuccess(sender, context, result) {
            sender.result = result;
            if (!(result === null || result === void 0 ? void 0 : result.length)) {
                sender.state = AjaxState.failed;
                console.error("ajax success but failed to decode the response -> wellform expcted response is like this: [{Title:'',Description:'',IconUrl:'',Url:''}] ");
                return;
            }
            sender.state = AjaxState.success;
            if (this.isTyping) {
                return;
            }
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
            const id = this.safeId(groupTitle || 'group') + "-" + groupIndex;
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
            $(childrenItems).find("[target='$modal'][href]").off("click").on("click", function () {
                $('#global-search-modal').modal('hide');
            });
            this.modalHelper.enableLink($(childrenItems).find("[target='$modal'][href]"));
            this.resultsPanel.append(childrenItems);
        }
        safeId(title) {
            return title.replace(/[^a-zA-Z0-9]/g, '_');
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
                context.resultsPanel.find('.global-search-loading').remove();
                if (context.resultCount === 0) {
                    context.resultsPanel.html(`<div class='global-search-no-results'>` +
                        `<p>No results found for "<strong>${this.boldSearchAll(context.searchedText, context.searchedText)}</strong>"</p>` +
                        `</div>`);
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
define("plugins/slider", ["require", "exports"], function (require, exports) {
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
define("plugins/dateTimePickerBase", ["require", "exports", "config"], function (require, exports, config_5) {
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
                this.input.parent().find(".fa-calendar").parent(".input-group-addon").on('click', () => this.input.focus());
            }
            else
                alert("Don't know how to handle date control of " + control);
        }
    }
    exports.default = dateTimePickerBase;
});
define("plugins/datePicker", ["require", "exports", "config", "plugins/dateTimePickerBase"], function (require, exports, config_6, dateTimePickerBase_1) {
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
define("plugins/dateTimePicker", ["require", "exports", "plugins/dateTimePickerBase", "config"], function (require, exports, dateTimePickerBase_2, config_7) {
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
define("plugins/numericUpDown", ["require", "exports"], function (require, exports) {
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
define("plugins/fileUpload", ["require", "exports", "components/crossDomainEvent", "file-style"], function (require, exports, crossDomainEvent_3) {
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
            this.deleteButton = this.container.find(".delete-file").on('click', (e) => this.onDeleteButtonClicked());
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
                .on('click', () => this.currentFileLink[0].click());
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
define("plugins/confirmBox", ["require", "exports"], function (require, exports) {
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
define("plugins/subMenu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SubMenu {
        static enable(selector) { selector.each((i, e) => new SubMenu($(e))); }
        static createAccordion(selector) {
            selector.find('[data-toggle]').on('click', (event) => {
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
define("plugins/instantSearch", ["require", "exports"], function (require, exports) {
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
define("plugins/dateDropdown", ["require", "exports"], function (require, exports) {
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
define("plugins/userHelp", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class UserHelp {
        static enable(selector) { selector.each((i, e) => new UserHelp($(e))); }
        constructor(element) {
            element.on('click', () => false);
            let message = element.attr('data-user-help');
            element['popover']({ trigger: 'focus', content: message, html: true });
            var inputsibling = element.parent().prev('[type=text]');
            if (inputsibling != undefined && inputsibling != null && inputsibling.length > 0)
                inputsibling['popover']({ trigger: 'focus', content: message, html: true, placement: 'top' });
        }
    }
    exports.default = UserHelp;
});
define("plugins/multiSelect", ["require", "exports", "bootstrap-select"], function (require, exports) {
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
define("plugins/customCheckbox", ["require", "exports"], function (require, exports) {
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
            checkBox.on('click', toggle);
            this.input.after(checkBox);
            this.input.addClass(CustomCheckbox.handledClassName);
        }
    }
    CustomCheckbox.handledClassName = 'handled';
    exports.default = CustomCheckbox;
});
define("plugins/customRadio", ["require", "exports"], function (require, exports) {
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
            radio.on('click', check);
            this.input.after(radio);
            this.input.addClass(CustomRadio.handledClassName);
        }
    }
    CustomRadio.handledClassName = 'handled';
    exports.default = CustomRadio;
});
define("plugins/ckEditorFileManager", ["require", "exports"], function (require, exports) {
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
                this.handleFileSelection(uri);
            });
        }
        handleFileSelection(uri) {
            // Support both CKEditor 4 and 5
            if (this.isCKEditor5()) {
                this.handleCKEditor5FileSelection(uri);
            }
            else {
                this.handleCKEditor4FileSelection(uri);
            }
        }
        isCKEditor5() {
            // Check if we're in a CKEditor 5 context
            return window.opener && (typeof window.opener["ClassicEditor"] !== "undefined" ||
                typeof window.opener["DecoupledEditor"] !== "undefined" ||
                typeof window.opener["InlineEditor"] !== "undefined" ||
                // Check for CKEditor 5 global object
                window.opener.ckeditor5 !== undefined);
        }
        handleCKEditor5FileSelection(uri) {
            // CKEditor 5 file selection handling
            try {
                // Try to use the modern CKEditor 5 API
                if (window.opener && window.opener.ckeditor5) {
                    // Use CKEditor 5's file selection API
                    const ckeditor5 = window.opener.ckeditor5;
                    if (ckeditor5.fileSelectionCallback) {
                        ckeditor5.fileSelectionCallback(uri);
                    }
                    else {
                        // Fallback to postMessage for CKEditor 5
                        window.opener.postMessage({
                            type: 'ckeditor5-file-selected',
                            url: uri
                        }, '*');
                    }
                }
                else {
                    // Fallback to CKEditor 4 method
                    this.handleCKEditor4FileSelection(uri);
                }
            }
            catch (error) {
                console.error("Error handling CKEditor 5 file selection:", error);
                // Fallback to CKEditor 4 method
                this.handleCKEditor4FileSelection(uri);
            }
            window.close();
        }
        handleCKEditor4FileSelection(uri) {
            // Legacy CKEditor 4 file selection handling
            try {
                if (window.opener && window.opener["CKEDITOR"]) {
                    window.opener["CKEDITOR"].tools.callFunction(this.url.getQuery('CKEditorFuncNum'), uri);
                }
                else {
                    console.error("CKEditor not found in parent window");
                }
            }
            catch (error) {
                console.error("Error handling CKEditor 4 file selection:", error);
            }
            window.close();
        }
    }
    exports.default = CKEditorFileManager;
});
define("components/grouping", ["require", "exports"], function (require, exports) {
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
define("di/serviceDescription", ["require", "exports"], function (require, exports) {
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
define("di/serviceContainer", ["require", "exports", "di/serviceDescription"], function (require, exports, serviceDescription_1) {
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
define("plugins/sanityAdapter", ["require", "exports"], function (require, exports) {
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
define("plugins/testingContext", ["require", "exports"], function (require, exports) {
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
define("olivePage", ["require", "exports", "config", "components/crossDomainEvent", "mvc/responseProcessor", "mvc/ajaxRedirect", "mvc/standardAction", "mvc/serverInvoker", "mvc/windowEx", "components/form", "components/url", "extensions/systemExtensions", "components/modal", "components/validate", "components/sorting", "components/paging", "components/masterDetail", "components/alert", "components/waiting", "components/grid", "plugins/select", "plugins/passwordStength", "plugins/htmlEditor", "plugins/timeControl", "plugins/autoComplete", "plugins/globalSearch", "plugins/slider", "plugins/datePicker", "plugins/dateTimePicker", "plugins/numericUpDown", "plugins/fileUpload", "plugins/confirmBox", "plugins/subMenu", "plugins/instantSearch", "plugins/dateDropdown", "plugins/userHelp", "plugins/multiSelect", "plugins/customCheckbox", "plugins/customRadio", "plugins/ckEditorFileManager", "components/grouping", "di/serviceContainer", "di/services", "plugins/sanityAdapter", "plugins/testingContext", "components/mainTag"], function (require, exports, config_8, crossDomainEvent_4, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_2, sanityAdapter_1, testingContext_1, mainTag_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OlivePage {
        constructor() {
            this.initializeActions = [];
            this.preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            this.modal = this.getService(services_2.default.ModalHelper);
            this.waiting = this.getService(services_2.default.Waiting);
            this.mainTag = this.getService(services_2.default.MainTagHelper);
            window.testingContext = this.getService(services_2.default.TestingContext);
            this.initializeServices();
            // ASP.NET needs this config for Request.IsAjaxRequest()
            $.ajaxSetup({
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            $(() => {
                // $.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS,
                //      { backdrop: this.DEFAULT_MODAL_BACKDROP });
                // $.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                this.getService(services_2.default.Alert).enableAlert();
                this.getService(services_2.default.Validate).configure();
                this.onViewChanged(null, null, true, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            this.getService(services_2.default.ResponseProcessor)
                .viewChanged.handle((x) => this.onViewChanged(x.container, x.trigger, x.isNewPage));
            crossDomainEvent_4.default.handle("refresh-page", (x) => this.refresh());
        }
        initializeServices() {
            this.modal.initialize();
            this.mainTag.initialize();
            this.getService(services_2.default.StandardAction).initialize();
            this.getService(services_2.default.Validate).initialize();
            this.getService(services_2.default.MasterDetail).initialize();
        }
        configureServices(services) {
            const out = {};
            services.tryAddSingleton(services_2.default.ServiceLocator, () => this, out);
            services.tryAddSingleton(services_2.default.ConfirmBoxFactory, () => new confirmBox_1.default(), out);
            services.tryAddSingleton(services_2.default.Alert, () => new alert_1.default(), out);
            services.tryAddSingleton(services_2.default.Url, () => new url_1.default(), out);
            services.tryAddSingleton(services_2.default.Grid, () => new grid_1.default(), out);
            services.tryAddSingleton(services_2.default.Select, () => new select_1.default(), out);
            services.tryAddSingleton(services_2.default.ResponseProcessor, () => new responseProcessor_1.default(), out);
            services.tryAddSingleton(services_2.default.SanityAdapter, () => new sanityAdapter_1.default(), out);
            if (services.tryAddSingleton(services_2.default.Waiting, (url) => new waiting_1.default(url), out)) {
                out.value.withDependencies(services_2.default.Url);
            }
            if (services.tryAddSingleton(services_2.default.GlobalSearchFactory, (waiting) => new globalSearch_1.GlobalSearchFactory(waiting, this.getService(services_2.default.ModalHelper)), out)) {
                out.value.withDependencies(services_2.default.Waiting);
            }
            if (services.tryAddSingleton(services_2.default.CKEditorFileManagerFactory, (url) => new ckEditorFileManager_1.CKEditorFileManagerFactory(url), out)) {
                out.value.withDependencies(services_2.default.Url);
            }
            if (services.tryAddSingleton(services_2.default.Sorting, (url, serverInvoker) => new sorting_1.default(url, serverInvoker), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_2.default.Paging, (url, serverInvoker) => new paging_1.default(url, serverInvoker), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_2.default.FileUploadFactory, (url, serverInvoker) => new fileUpload_1.FileUploadFactory(url, serverInvoker), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_2.default.GroupingFactory, (url, ajaxRedirect) => new grouping_1.GroupingFactory(url, ajaxRedirect), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_2.default.ModalHelper, (url, ajaxRedirect, responseProcessor) => new modal_1.ModalHelper(url, ajaxRedirect, responseProcessor), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.AjaxRedirect, services_2.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_2.default.MainTagHelper, (url, ajaxRedirect, responseProcessor) => new mainTag_1.MainTagHelper(url, ajaxRedirect, responseProcessor), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.AjaxRedirect, services_2.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_2.default.WindowEx, (modalHelper, mainTagHelper, ajaxRedirect) => new windowEx_1.default(modalHelper, mainTagHelper, ajaxRedirect), out)) {
                out.value.withDependencies(services_2.default.ModalHelper, services_2.default.MainTagHelper, services_2.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_2.default.AutoCompleteFactory, (url, form, serverInvoker) => new autoComplete_1.AutoCompleteFactory(url, form, serverInvoker), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.Form, services_2.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_2.default.SliderFactory, (form) => new slider_1.SliderFactory(form), out)) {
                out.value.withDependencies(services_2.default.Form);
            }
            if (services.tryAddSingleton(services_2.default.HtmlEditorFactory, (modalHelper) => new htmlEditor_1.HtmlEditorFactory(modalHelper), out)) {
                out.value.withDependencies(services_2.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_2.default.DateTimePickerFactory, (modalHelper) => new dateTimePicker_1.DateTimePickerFactory(modalHelper), out)) {
                out.value.withDependencies(services_2.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_2.default.DatePickerFactory, (modalHelper) => new datePicker_1.DatePickerFactory(modalHelper), out)) {
                out.value.withDependencies(services_2.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_2.default.MultiSelectFactory, (modalHelper) => new multiSelect_1.MultiSelectFactory(modalHelper), out)) {
                out.value.withDependencies(services_2.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_2.default.TimeControlFactory, (modalHelper) => new timeControl_1.TimeControlFactory(modalHelper), out)) {
                out.value.withDependencies(services_2.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_2.default.AjaxRedirect, (url, responseProcessor, waiting) => new ajaxRedirect_1.default(url, responseProcessor, waiting), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.ResponseProcessor, services_2.default.Waiting);
            }
            if (services.tryAddSingleton(services_2.default.Form, (url, validate, waiting, ajaxRedirect) => new form_1.default(url, validate, waiting, ajaxRedirect), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.Validate, services_2.default.Waiting, services_2.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_2.default.Validate, (alert, responseProcessor) => new validate_1.default(alert, responseProcessor), out)) {
                out.value.withDependencies(services_2.default.Alert, services_2.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_2.default.MasterDetail, (validate, responseProcessor) => new masterDetail_1.default(validate, responseProcessor), out)) {
                out.value.withDependencies(services_2.default.Validate, services_2.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_2.default.TestingContext, (ajaxRedirect, modalHelper, serverInvoker) => new testingContext_1.default(ajaxRedirect, modalHelper, serverInvoker), out)) {
                out.value.withDependencies(services_2.default.AjaxRedirect, services_2.default.ModalHelper, services_2.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_2.default.StandardAction, (alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, mainTagHelper, serviceLocator) => new standardAction_1.default(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, mainTagHelper, serviceLocator), out)) {
                out.value.withDependencies(services_2.default.Alert, services_2.default.Form, services_2.default.Waiting, services_2.default.AjaxRedirect, services_2.default.ResponseProcessor, services_2.default.Select, services_2.default.ModalHelper, services_2.default.MainTagHelper, services_2.default.ServiceLocator);
            }
            if (services.tryAddSingleton(services_2.default.ServerInvoker, (url, validate, waiting, form, responseProcessor) => new serverInvoker_1.default(url, validate, waiting, form, responseProcessor), out)) {
                out.value.withDependencies(services_2.default.Url, services_2.default.Validate, services_2.default.Waiting, services_2.default.Form, services_2.default.ResponseProcessor);
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
            const standardAction = this.getService(services_2.default.StandardAction);
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
            const grid = this.getService(services_2.default.Grid);
            grid.mergeActionButtons();
            grid.enableColumn($(".select-cols .apply"));
            grid.enableSelectCol($(".select-grid-cols .group-control"));
            grid.enableToggle($("th.select-all > input:checkbox"));
            this.getService(services_2.default.MasterDetail).enable($("[data-delete-subform]"));
            const paging = this.getService(services_2.default.Paging);
            paging.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
            const sorting = this.getService(services_2.default.Sorting);
            sorting.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
            paging.enableWithAjax($("a[data-pagination]"));
            sorting.enableAjaxSorting($("a[data-sort]"));
            sorting.setSortHeaderClass($("th[data-sort]"));
            const form = this.getService(services_2.default.Form);
            this.enablecleanUpNumberField(form);
            this.modal.enableEnsureHeight($("[data-toggle=tab]"));
            //this.getService<MultiSelect>(Services.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
            this.getService(services_2.default.Select)
                .enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_2.default.ModalHelper).enableLink($("[target='$modal'][href]")
                .not('[href="#"]')
                .not('[href=""]')
                .not('[href^="javascript:"]'));
            this.getService(services_2.default.MainTagHelper).enableLink($("[target^='$']:not([target = '$modal'])[href]")
                .not('[href="#"]')
                .not('[href=""]')
                .not('[href^="javascript:"]'));
            this.getService(services_2.default.GroupingFactory).enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", (e) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            this.getService(services_2.default.AutoCompleteFactory).enable($("input[autocomplete-source]"));
            this.getService(services_2.default.CKEditorFileManagerFactory)
                .enable($(".ckeditor-file-uri"));
            this.getService(services_2.default.GlobalSearchFactory).enable($("input[data-search-source]"));
            this.getService(services_2.default.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
            this.getService(services_2.default.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
            this.getService(services_2.default.MultiSelectFactory).enable($("[data-control=collapsible-checkboxes]"));
            this.getService(services_2.default.TimeControlFactory).enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            this.getService(services_2.default.HtmlEditorFactory).enable($("[data-control=html-editor]"));
            numericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            this.getService(services_2.default.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
            this.getService(services_2.default.FileUploadFactory).enable($(".file-upload input:file"));
            this.getService(services_2.default.ConfirmBoxFactory).enable($("[data-confirm-question]"));
            passwordStength_1.default.enable($(".password-strength"));
            subMenu_1.default.enable($(".with-submenu"));
            subMenu_1.default.createAccordion($("ul.accordion"));
            this.enableCustomCheckbox();
            this.enableCustomRadio();
            this.customizeValidationTooltip();
            // =================== Request lifecycle ====================
            this.getService(services_2.default.WindowEx).enableBack($(window));
            this.getService(services_2.default.AjaxRedirect).enableRedirect($("a[data-redirect=ajax]"));
            form.enablesubmitCleanGet($("form[method=get]"));
            const formAction = this.getService(services_2.default.ServerInvoker);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_2.default.MasterDetail).updateSubFormStates();
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
            const url = this.getService(services_2.default.Url);
            var returnUrl = url.getQuery("ReturnUrl");
            returnUrl = url.decodeGzipUrl(returnUrl);
            if (returnUrl && target && $(target).is("[data-redirect=ajax]")) {
                const link = $(target);
                let ajaxTarget = link.attr("ajax-target");
                let ajaxhref = link.attr("href");
                this.getService(services_2.default.AjaxRedirect).go(returnUrl, $(target), false, false, true, undefined, ajaxTarget, ajaxhref);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiLCIuLi9zcmMvY29tcG9uZW50cy9saXRlRXZlbnQudHMiLCIuLi9zcmMvbXZjL3Jlc3BvbnNlUHJvY2Vzc29yLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvdXJsLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvd2FpdGluZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiLCIuLi9zcmMvZGkvc2VydmljZXMudHMiLCIuLi9zcmMvbXZjL2FqYXhSZWRpcmVjdC50cyIsIi4uL3NyYy9jb21wb25lbnRzL2FsZXJ0LnRzIiwiLi4vc3JjL3BsdWdpbnMvc2VsZWN0LnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvbW9kYWwudHMiLCIuLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiLCIuLi9zcmMvbXZjL3N0YW5kYXJkQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9zZXJ2ZXJJbnZva2VyLnRzIiwiLi4vc3JjL212Yy93aW5kb3dFeC50cyIsIi4uL3NyYy9leHRlbnNpb25zL2pRdWVyeUV4dGVuc2lvbnMudHMiLCIuLi9zcmMvZXh0ZW5zaW9ucy9zeXN0ZW1FeHRlbnNpb25zLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvc29ydGluZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL3BhZ2luZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL21hc3RlckRldGFpbC50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyaWQudHMiLCIuLi9zcmMvcGx1Z2lucy9wYXNzd29yZFN0ZW5ndGgudHMiLCIuLi9zcmMvcGx1Z2lucy9odG1sRWRpdG9yLnRzIiwiLi4vc3JjL3BsdWdpbnMvdGltZUNvbnRyb2wudHMiLCIuLi9zcmMvcGx1Z2lucy9hdXRvQ29tcGxldGUudHMiLCIuLi9zcmMvcGx1Z2lucy9nbG9iYWxTZWFyY2gudHMiLCIuLi9zcmMvcGx1Z2lucy9zbGlkZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlckJhc2UudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlUGlja2VyLnRzIiwiLi4vc3JjL3BsdWdpbnMvZGF0ZVRpbWVQaWNrZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9udW1lcmljVXBEb3duLnRzIiwiLi4vc3JjL3BsdWdpbnMvZmlsZVVwbG9hZC50cyIsIi4uL3NyYy9wbHVnaW5zL2NvbmZpcm1Cb3gudHMiLCIuLi9zcmMvcGx1Z2lucy9zdWJNZW51LnRzIiwiLi4vc3JjL3BsdWdpbnMvaW5zdGFudFNlYXJjaC50cyIsIi4uL3NyYy9wbHVnaW5zL2RhdGVEcm9wZG93bi50cyIsIi4uL3NyYy9wbHVnaW5zL3VzZXJIZWxwLnRzIiwiLi4vc3JjL3BsdWdpbnMvbXVsdGlTZWxlY3QudHMiLCIuLi9zcmMvcGx1Z2lucy9jdXN0b21DaGVja2JveC50cyIsIi4uL3NyYy9wbHVnaW5zL2N1c3RvbVJhZGlvLnRzIiwiLi4vc3JjL3BsdWdpbnMvY2tFZGl0b3JGaWxlTWFuYWdlci50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyb3VwaW5nLnRzIiwiLi4vc3JjL2RpL3NlcnZpY2VEZXNjcmlwdGlvbi50cyIsIi4uL3NyYy9kaS9zZXJ2aWNlQ29udGFpbmVyLnRzIiwiLi4vc3JjL3BsdWdpbnMvc2FuaXR5QWRhcHRlci50cyIsIi4uL3NyYy9wbHVnaW5zL3Rlc3RpbmdDb250ZXh0LnRzIiwiLi4vc3JjL29saXZlUGFnZS50cyIsIi4uL3NyYy9kaS9JU2VydmljZS50cyIsIi4uL3NyYy9kaS9pU2VydmljZUxvY2F0b3IudHMiLCIuLi9zcmMvZGkvb3V0UGFyYW0udHMiLCIuLi9zcmMvbXZjL2NvbWJpbmVkVXRpbGl0aWVzLnRzIiwiLi4vc3JjL212Yy9mb3JtQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9pSW52b2NhdGlvbkNvbnRleHQudHMiLCIuLi9zcmMvbXZjL2ludGVyZmFjZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBQUEsTUFBcUIsTUFBTTs7SUFFdkIseURBQXlEO0lBQzNDLGtCQUFXLEdBQUcsT0FBTyxDQUFDO0lBQ3RCLGtCQUFXLEdBQUcsWUFBWSxDQUFDO0lBQzNCLHVCQUFnQixHQUFHLGtCQUFrQixDQUFDO0lBQ3RDLHVCQUFnQixHQUFHLENBQUMsQ0FBQztJQUNyQixrQkFBVyxHQUFHLE9BQU8sQ0FBQztJQUV0QixrQ0FBMkIsR0FBRyxJQUFJLENBQUM7SUFDbkMsMEJBQW1CLEdBQUcsSUFBSSxDQUFDO0lBQzNCLCtCQUF3QixHQUFHLEdBQUcsQ0FBQztJQUMvQiw2QkFBc0IsR0FBRyxRQUFRLENBQUM7SUFFaEQ7d0VBQ29FO0lBQ3RELCtCQUF3QixHQUFHLFFBQVEsQ0FBQztJQUVsRCxtREFBbUQ7SUFDckMsMEJBQW1CLEdBQUcsZ0JBQWdCLENBQUM7SUFDdkMsd0JBQWlCLEdBQXdCLE1BQU0sQ0FBQyxDQUFDLHNCQUFzQjtJQUN2RSx5QkFBa0IsR0FBcUUsU0FBUyxDQUFDLENBQUMsK0RBQStEO0lBQ2pLLDBCQUFtQixHQUFHLElBQUksQ0FBQyxDQUFDLDhDQUE4QztJQUV4RiwrQkFBK0I7SUFDakIseUJBQWtCLEdBQUc7UUFDL0IsUUFBUSxFQUFFLElBQUk7UUFDZCxXQUFXLEVBQUUsdUJBQXVCO1FBQ3BDLG1EQUFtRDtLQUN0RCxDQUFDO3NCQTdCZSxNQUFNOzs7OztJQ08zQixNQUFxQixnQkFBZ0I7UUFDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFpQyxFQUFFLE9BQTZCO1lBQ2pGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDckMsSUFBSSxDQUFDO29CQUVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztvQkFFaEIsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDakUsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QixDQUFDO3lCQUFNLENBQUM7d0JBQ0osSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQzFDLENBQUM7b0JBRUQsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRSxDQUFDO3dCQUFDLE9BQU87b0JBQUMsQ0FBQztvQkFFekMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDdEIsQ0FBQztnQkFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO29CQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pCLENBQUM7WUFDTCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDO1FBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFjLEVBQUUsT0FBaUMsRUFBRSxNQUFXLElBQUk7WUFDbEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDeEIsT0FBTztnQkFDUCxHQUFHO2FBQ04sQ0FBQyxDQUFDO1lBRUgsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbEMsQ0FBQztLQUNKO0lBOUJELG1DQThCQzs7Ozs7SUNyQ0QsTUFBcUIsU0FBUztRQUE5QjtZQUNZLGFBQVEsR0FBNEIsRUFBRSxDQUFDO1FBYW5ELENBQUM7UUFYVSxNQUFNLENBQUMsT0FBNkI7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUE2QjtZQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxDQUFDO1FBQzdELENBQUM7UUFFTSxLQUFLLENBQUMsSUFBUTtZQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDO0tBQ0o7SUFkRCw0QkFjQzs7Ozs7SUNaRCxNQUFxQixpQkFBaUI7UUFBdEM7WUFDWSxpQ0FBNEIsR0FBRyxFQUFFLENBQUM7WUFFbkMsbUJBQWMsR0FBRyxJQUFJLG1CQUFTLEVBQStCLENBQUM7WUFDOUQsZ0JBQVcsR0FBRyxJQUFJLG1CQUFTLEVBQXlCLENBQUM7WUFDckQscUJBQWdCLEdBQUcsSUFBSSxtQkFBUyxFQUFjLENBQUM7WUFDL0MsMEJBQXFCLEdBQUcsSUFBSSxtQkFBUyxFQUErQixDQUFDO1FBNlJoRixDQUFDO1FBM1JVLG1CQUFtQixDQUFDLFFBQWEsRUFBRSxlQUF1QixFQUFFLE9BQWUsRUFBRSxJQUFTLEVBQUUsVUFBbUIsRUFBRSxRQUFpQjtZQUNqSSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFNUIsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDYixPQUFPO1lBQ1gsQ0FBQztZQUVELElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDM0QsZUFBZSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDN0UsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN4RCxlQUFlLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDdkMsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLElBQUksZUFBZSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUN6RSxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ25ELElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxHQUFHLHVCQUF1QixDQUFDLENBQUM7Z0JBRS9GLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUNyQixTQUFTLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLEdBQUcsU0FBUyxDQUFDLENBQUM7Z0JBRWpGLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzVCLDJDQUEyQztnQkFDM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLE9BQU87WUFDWCxDQUFDO1lBRUQsa0JBQWtCO1lBQ2xCLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEQsQ0FBQztRQUNTLHVCQUF1QixDQUFDLFFBQWEsRUFBRSxPQUFlO1lBQzVELElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFUyxnQkFBZ0IsQ0FBQyxRQUFhLEVBQUUsT0FBZTtZQUNyRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUVTLGFBQWEsQ0FBQyxTQUFpQixFQUFFLE9BQWUsRUFBRSxZQUFxQixLQUFLO1lBQ2xGLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFUyxRQUFRLENBQUMsT0FBZSxFQUFFLE9BQWUsRUFBRSxJQUFTO1lBQzFELE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV2QyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUU5QywyQ0FBMkM7WUFDM0MsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztZQUNqQixTQUFTLHNCQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRO2dCQUMzQyxjQUFjLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxjQUFjLElBQUksUUFBUTtvQkFDMUIsS0FBSyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLENBQUE7WUFDOUUsQ0FBQztZQUNELElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDYixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxDQUFDO2dCQUNILGtHQUFrRztnQkFDbEcseUJBQXlCO1lBQzdCLENBQUM7O2dCQUVHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFUyxvQkFBb0IsQ0FBQyxPQUFlLEVBQUUsVUFBa0I7WUFDOUQsZ0VBQWdFO1lBQ2hFLDJGQUEyRjtZQUMzRix1REFBdUQ7WUFDdkQsb0RBQW9EO1lBQ3BELHdEQUF3RDtZQUN4RCxvQkFBb0I7WUFDcEIsV0FBVztZQUNYLE9BQU87WUFDUCxHQUFHO1lBRUgsb0VBQW9FO1lBQ3BFLHNGQUFzRjtZQUN0RixhQUFhO1lBQ2IsR0FBRztZQUVILE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRTlDLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxhQUFhLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ25ELElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ2xGLE9BQU87WUFDWCxDQUFDO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFakMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtnQkFDMUIsSUFBSSxDQUFDLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7b0JBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDN0IsNkNBQTZDO1lBQzdDLDRCQUE0QjtRQUNoQyxDQUFDO1FBRU8sU0FBUyxDQUFDLE9BQWU7WUFDN0IsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBRXhDLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRU8sTUFBTSxDQUFDLE1BQWM7WUFDekIsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQUNqQyxNQUFNLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRVMscUJBQXFCLENBQUMsT0FBZSxFQUFFLE9BQWUsRUFBRSxJQUFTLEVBQUUsaUJBQXlCO1lBRWxHLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsQixjQUFjLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsQ0FBQztZQUVELElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtRQUNqRyxDQUFDO1FBRU8sNkJBQTZCLENBQUMsY0FBc0IsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLElBQVMsRUFBRSxpQkFBeUI7WUFDaEksTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hDLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO1lBRTdCLElBQUksT0FBTyxHQUFHLGNBQWMsS0FBSyxJQUFJLElBQUksY0FBYyxLQUFLLFNBQVM7Z0JBQ2pFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQy9DLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsR0FBRyxjQUFjLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFaEgsSUFBSSxPQUFPLElBQUksU0FBUyxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEUsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztnQkFDdEMsSUFBSSxRQUFRLElBQUksU0FBUyxJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDbkUsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUN0QixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7d0JBQzNDLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDcEMsSUFBSSxXQUFXLENBQUMsU0FBUyxJQUFJLFFBQVEsRUFBRSxDQUFDOzRCQUNwQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzRCQUNqQixNQUFNO3dCQUNWLENBQUM7b0JBQ0wsQ0FBQztvQkFDRCxJQUFJLFNBQVMsSUFBSSxLQUFLO3dCQUFFLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQzNDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxPQUFPLElBQUksU0FBUyxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFekYsSUFBSSxjQUFjO2dCQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRXpELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRXRDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO29CQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzVDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNmLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztvQkFBRSxPQUFPO2dCQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLEdBQXVCLFNBQVMsQ0FBQztZQUMvQyxJQUFJLFNBQVMsR0FBdUIsU0FBUyxDQUFDO1lBRTlDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNqRCxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLFVBQVUsQ0FBQztZQUUzRCx5QkFBeUI7WUFDekIsMERBQTBEO1lBRTFELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxVQUFVO21CQUNyQixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFLLElBQUksZ0JBQWdCLENBQUM7bUJBQzlELENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRXRFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDWCxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDekYsT0FBTTtZQUNWLENBQUM7WUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssTUFBTSxDQUFDO1lBRTdCLFVBQVUsR0FBRyxVQUFVO2lCQUNsQixPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQztpQkFDdEIsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7aUJBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFMUIsUUFBUSxVQUFVLEVBQUUsQ0FBQztnQkFDakIsS0FBSyxPQUFPO29CQUNSLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDM0QsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO29CQUM5RCxNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxVQUFVLEdBQUcsWUFBWSxDQUFDO29CQUMxQixTQUFTLEdBQUcsYUFBYSxDQUFDO29CQUMxQixNQUFNO2dCQUNWO29CQUNJLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxVQUFVLGdCQUFnQixDQUFDLENBQUE7b0JBQ3hELE1BQU07WUFDZCxDQUFDO1lBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVPLGNBQWMsQ0FBQyxpQkFBeUIsRUFBRSxPQUFlLEVBQUUsT0FBZSxFQUFFLE9BQWUsRUFBRSxVQUE4QixFQUFFLFNBQTZCO1lBRTlKLElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDZCxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixJQUFJLFVBQVU7b0JBQ1YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDeEQsQ0FBQyxDQUFBO1lBRUQsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDWixPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM1QixVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNaLE1BQU0sRUFBRSxDQUFDO2dCQUNiLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNaLENBQUM7aUJBQU0sQ0FBQztnQkFDSixNQUFNLEVBQUUsQ0FBQztZQUNiLENBQUM7UUFDTCxDQUFDO1FBRVMsU0FBUyxDQUFDLGlCQUF5QixFQUFFLE9BQWUsRUFBRSxPQUFlO1lBQzNFLElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksZUFBZSxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztnQkFDL0MsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUU7b0JBQy9CLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7b0JBQ3BCLElBQUksSUFBSSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUN0RCxhQUFhLEVBQUUsQ0FBQzt3QkFDaEIsSUFBSSxhQUFhLElBQUksZUFBZTs0QkFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNuRCxDQUFDO3lCQUNJLENBQUM7d0JBQ0YsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDNUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFOzRCQUNsQixhQUFhLEVBQUUsQ0FBQzs0QkFDaEIsSUFBSSxhQUFhLElBQUksZUFBZTtnQ0FDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNuRCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQzs7Z0JBQ0ksSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRWhELElBQUksbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVFLElBQUksa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTdELElBQUksbUJBQW1CLEtBQUssU0FBUyxJQUFJLG1CQUFtQixLQUFLLFNBQVM7Z0JBQ3RFLFFBQVEsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLGFBQW5CLG1CQUFtQixjQUFuQixtQkFBbUIsR0FBSSxrQkFBa0IsQ0FBQztZQUUvRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM5QixDQUFDO1FBRVMsa0JBQWtCO1lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsQ0FBQztLQUNKO0lBblNELG9DQW1TQzs7Ozs7SUNsU0QsTUFBcUIsR0FBRztRQUF4QjtZQUVXLHlCQUFvQixHQUErQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUvRSwyQkFBc0IsR0FBaUIsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQXlLMUQsbUJBQWMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDO1FBYzFELENBQUM7UUFyTFUsYUFBYSxDQUFDLFFBQWdCO1lBQ2pDLElBQUksUUFBUSxLQUFLLFNBQVMsSUFBSSxRQUFRLEtBQUssSUFBSTtnQkFBRSxPQUFPLFFBQVEsQ0FBQztZQUNqRSxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUM7WUFDdkIsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQy9DLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksRUFBRSxLQUFLO29CQUN2RCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxXQUFXLEVBQUUsQ0FBQzt3QkFDcEMsT0FBTyxHQUFHLEtBQUssQ0FBQztvQkFDcEIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSztnQkFBRSxPQUFPLFFBQVEsQ0FBQTtZQUV2RCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDcEwsSUFBSSxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFBRSxPQUFPO1lBQzFELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFFLElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRCxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUN6RSxhQUFhLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbEQsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzdCLE9BQU8sYUFBYSxDQUFDO1lBQ3pCLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQztnQkFDdEcsT0FBTyxNQUFNLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUM7UUFFTSxhQUFhLENBQUMsVUFBa0I7WUFDbkMsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsS0FBSyxJQUFJO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBRS9ELElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNsRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUM5RSxVQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3BGLE9BQU8sS0FBSyxHQUFHLFVBQVUsQ0FBQztRQUM5QixDQUFDO1FBRU0sWUFBWSxDQUFDLE9BQWUsRUFBRSxXQUFtQjtZQUNwRCxPQUFPLEdBQUcsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzVDLFdBQVcsR0FBRyxXQUFXLElBQUksRUFBRSxDQUFDO1lBRWhDLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUFFLFdBQVcsR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDO1lBRW5FLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUc7Z0JBQ3pDLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXZELE9BQU8sT0FBTyxHQUFHLFdBQVcsQ0FBQztRQUNqQyxDQUFDO1FBRU0sWUFBWSxDQUFDLEdBQVc7WUFDM0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDcEIsT0FBTyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O2dCQUN6QyxPQUFPLEdBQUcsQ0FBQztRQUNwQixDQUFDO1FBRU0sVUFBVSxDQUFDLEdBQVc7WUFDekIsSUFBSSxDQUFDLEdBQUc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDdkIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4QixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFTSxPQUFPLEtBQWEsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEQsTUFBTSxDQUFDLE1BQU07WUFDaEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztnQkFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ3pFLENBQUM7Z0JBQ0YsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDM0MsU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzFDLElBQUksU0FBUztvQkFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7O29CQUMzQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7UUFFTSxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLO1lBQzlCLElBQUksR0FBRyxJQUFJLElBQUk7Z0JBQUUsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBRTVDLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZELElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ3BELElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7O2dCQUN0RSxPQUFPLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDcEQsQ0FBQztRQUVNLFdBQVcsQ0FBQyxHQUFXLEVBQUUsU0FBaUI7WUFDN0MsMkRBQTJEO1lBQzNELElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN2QixJQUFJLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBQy9ELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRXZDLHlDQUF5QztnQkFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDO29CQUNsQyw2QkFBNkI7b0JBQzdCLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDdkQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUUxQyxPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLEdBQUcsQ0FBQztZQUNmLENBQUM7UUFDTCxDQUFDO1FBRU0sUUFBUSxDQUFDLElBQVksRUFBRSxNQUFjLElBQUk7WUFDNUMsSUFBSSxHQUFHO2dCQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztnQkFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUNyRSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxRCxJQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMzRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7UUFFTSxhQUFhLENBQUMsSUFBWTtZQUM3QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBRU0saUJBQWlCLENBQUMsR0FBVztZQUNoQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztRQUMzRCxDQUFDO1FBRU8sYUFBYTtZQUNqQixJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBRU8sZUFBZSxDQUFDLEdBQVc7WUFDL0IsSUFBSSxHQUFHLElBQUksU0FBUyxJQUFJLEdBQUcsSUFBSSxJQUFJO2dCQUMvQixHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRXpCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQUUsT0FBTyxFQUFFLENBQUM7WUFFdEMsT0FBTyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRU0sUUFBUSxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsS0FBSyxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFcEgsa0JBQWtCLENBQUMsR0FBVztZQUVqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDaEUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBRWhCLEtBQUssSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQ2xCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksU0FBUztvQkFBRSxNQUFNLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ3ZFLENBQUM7WUFFRCxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVuRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUFFLE1BQU0sR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQzs7Z0JBQy9FLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFFbEIsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFBRSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU5RixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU0sZUFBZTtZQUNsQixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBQzNELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ3RDLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUM1QixNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsT0FBTyxVQUFVLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN4QyxDQUFDO1FBQUEsQ0FBQztRQUlLLFNBQVMsQ0FBQyxXQUFtQjtZQUNoQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDbEMsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHO2dCQUNuRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUU5QyxPQUFPLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO2dCQUNuRCxXQUFXLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzQyxPQUFPLElBQUksR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFDO1FBQ3BDLENBQUM7S0FHSjtJQTNMRCxzQkEyTEM7Ozs7O0lDNUxELE1BQXFCLE9BQU87UUFFeEIsWUFBb0IsR0FBUTtZQUFSLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBSSxDQUFDO1FBRTFCLElBQUksQ0FBQyxjQUF1QixLQUFLLEVBQUUsV0FBb0IsSUFBSTtZQUU5RCxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUU7b0JBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTt3QkFBRSxPQUFPO1lBQ2xELENBQUM7WUFFRCxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxXQUFXLEVBQUUsQ0FBQztnQkFDZCxDQUFDLENBQUMsdUJBQXVCLENBQUM7cUJBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztxQkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO3FCQUMxRCxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUIsQ0FBQztZQUVELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUN4QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsSUFBSSxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ3ZCLGNBQWMsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDMUMsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3RELGNBQWMsR0FBRyxZQUFZLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNyRCxDQUFDO1lBRUQsQ0FBQyxDQUFDLG9EQUFvRCxHQUFHLGNBQWMsR0FBRyxRQUFRLENBQUM7aUJBQzlFLFFBQVEsQ0FBQyxNQUFNLENBQUM7aUJBQ2hCLElBQUksRUFBRSxDQUFDO1FBQ2hCLENBQUM7UUFFTSxJQUFJO1lBQ1AsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQy9CLENBQUM7S0FDSjtJQXBDRCwwQkFvQ0M7Ozs7OztJQ3JCRCxNQUFhLGFBQWE7UUFJdEIsWUFDWSxHQUFRLEVBQ1IsWUFBMEIsRUFDMUIsaUJBQW9DO1lBRnBDLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUMxQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBTnhDLFVBQUssR0FBMkIsU0FBUyxDQUFDO1lBQzNDLGlCQUFZLEdBQUcsSUFBSSxtQkFBUyxFQUErQixDQUFDO1lBMEwzRCxrQkFBYSxHQUFHLEdBQUcsRUFBRTtnQkFDekIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDNUQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUE7Z0JBQy9ELENBQUM7WUFDTCxDQUFDLENBQUE7UUF4TEcsQ0FBQztRQUVFLFVBQVUsQ0FBQyxRQUFnQjtZQUM5QixRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVNLFVBQVU7WUFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxVQUFVO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDM0IsQ0FBQztRQUVNLGNBQWM7WUFDakIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3BCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFTyxzQkFBc0I7WUFDMUIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFbEMsOEJBQThCO1lBQzlCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztZQUVuQixJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDL0QsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ3pELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDOUMsT0FBTztvQkFFWCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQzt3QkFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNyQyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNsQixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFTyxpQkFBaUI7WUFDckIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLHNFQUFzRSxDQUFDLENBQUM7WUFFckYsOEJBQThCO1lBQzlCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztZQUVuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNuQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzlDLFNBQVM7Z0JBRWIsNEVBQTRFO2dCQUM1RSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ3JDLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2xCLENBQUM7WUFDTCxDQUFDO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQztRQUVNLGFBQWEsQ0FBQyxXQUFtQjtZQUNwQyxXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0MsSUFBSSxXQUFXLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFFdEYsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFFRCxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQ3JDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDMUQsQ0FBQztRQUNMLENBQUM7UUFFTSxTQUFTLENBQUMsR0FBVyxFQUFFLFdBQW1CLEVBQUUsS0FBYztZQUM3RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7WUFFcEIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxjQUFjLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0MsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxDQUFDO1lBQ3JFLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFDN0UsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLFdBQVcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQztZQUV0RixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ1gsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2hDLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUN4QixLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFDRCxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFBO2dCQUMxRSxDQUFDLENBQUMsQ0FBQTtZQUNOLENBQUM7WUFFRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsQ0FBQztZQUVELElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ2hGLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxjQUFzQjtZQUM1QyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTTtnQkFBRSxPQUFPO1lBRWhELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUUxQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDeEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQzNFLENBQUMsQ0FBQyxDQUFBO1FBQ04sQ0FBQztRQUVNLE1BQU0sQ0FBQyxLQUF5QixFQUFFLEdBQVk7WUFDakQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1lBQ3BCLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxjQUFjLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUM3RCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN6QyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RHLENBQUM7UUFFTSxXQUFXLENBQUMsV0FBbUIsRUFBRSxHQUFZO1lBQ2hELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtZQUNwQixXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0MsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQztZQUNwRSxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsY0FBYyxHQUFHLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDN0QsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUcsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVNLE1BQU0sQ0FBQyxXQUFtQjtZQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxjQUFjLEdBQUcsV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTTtnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUU5QyxnRkFBZ0Y7WUFDaEYsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQzFELE1BQU0sS0FBSyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUN6RSxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDcEQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sVUFBVSxHQUFHLEtBQUssSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDO1lBRXJELElBQUksQ0FBQyxVQUFVO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRTlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsQ0FBQztZQUM3RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQU9KO0lBak1ELHNDQWlNQztJQUVELE1BQXFCLE9BQU87UUFHeEIsWUFDWSxVQUFlLEVBQ2YsWUFBMEIsRUFDMUIsTUFBcUIsRUFDN0IsT0FBZSxFQUNQLE9BQWUsRUFDZixXQUFtQixFQUNuQixPQUFlO1lBTmYsZUFBVSxHQUFWLFVBQVUsQ0FBSztZQUNmLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLFdBQU0sR0FBTixNQUFNLENBQWU7WUFFckIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQ25CLFlBQU8sR0FBUCxPQUFPLENBQVE7WUFFdkIsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekUsQ0FBQztZQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7UUFFTSxNQUFNLENBQUMsWUFBcUIsSUFBSTs7WUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU87WUFDdEIsTUFBTSxJQUFJLEdBQUcsQ0FBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBSyxNQUFNLENBQUM7WUFDeEQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLE9BQU8sQ0FBQztZQUMxRSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUN6QixJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksRUFDSixLQUFLLEVBQ0wsS0FBSyxFQUNMLENBQUMsT0FBZ0IsRUFBRSxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTztvQkFBRSxPQUFPO2dCQUVyQixxREFBcUQ7Z0JBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxLQUFLLElBQUksU0FBUyxJQUFJLEtBQUssSUFBSSxJQUFJO29CQUNuQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRXhDLElBQUksU0FBUyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUM1RCxDQUFDO3FCQUFNLENBQUM7b0JBQ0osSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO3dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQ2hELENBQUM7b0JBQ0QsUUFBUSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7Z0JBQzNCLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFUyxVQUFVLENBQUMsVUFBa0I7WUFFbkMsY0FBYztZQUNkLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxPQUFPLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7Z0JBQ3RFLE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFFRCwyQkFBMkI7WUFDM0IsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUU5RSxJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQy9DLElBQUksZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBRWxFLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO29CQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7S0FDSjtJQXhFRCwwQkF3RUM7Ozs7O0lDNVJELE1BQU0sUUFBUSxHQUFHO1FBQ2IsS0FBSyxFQUFFLE9BQU87UUFDZCxnQkFBZ0IsRUFBRSxrQkFBa0I7UUFDcEMsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGVBQWUsRUFBRSxpQkFBaUI7UUFDbEMsU0FBUyxFQUFFLFdBQVc7UUFDdEIsWUFBWSxFQUFFLGNBQWM7UUFDNUIsS0FBSyxFQUFFLE9BQU87UUFDZCxXQUFXLEVBQUUsYUFBYTtRQUMxQixPQUFPLEVBQUMsU0FBUztRQUNqQixhQUFhLEVBQUMsZUFBZTtRQUM3QixNQUFNLEVBQUUsUUFBUTtRQUNoQixPQUFPLEVBQUUsU0FBUztRQUNsQixHQUFHLEVBQUUsS0FBSztRQUNWLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFlBQVksRUFBRSxjQUFjO1FBQzVCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGlCQUFpQixFQUFFLG1CQUFtQjtRQUN0QyxhQUFhLEVBQUUsZUFBZTtRQUM5QixjQUFjLEVBQUUsZ0JBQWdCO1FBQ2hDLFlBQVksRUFBRSxjQUFjO1FBQzVCLG1CQUFtQixFQUFFLHFCQUFxQjtRQUMxQyxtQkFBbUIsRUFBRSxxQkFBcUI7UUFDMUMsMEJBQTBCLEVBQUUsNEJBQTRCO1FBQ3hELGlCQUFpQixFQUFFLG1CQUFtQjtRQUN0QyxVQUFVLEVBQUUsWUFBWTtRQUN4QixjQUFjLEVBQUUsZ0JBQWdCO1FBQ2hDLFdBQVcsRUFBRSxhQUFhO1FBQzFCLFlBQVksRUFBRSxjQUFjO1FBQzVCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLGlCQUFpQixFQUFFLG1CQUFtQjtRQUN0QyxjQUFjLEVBQUUsZ0JBQWdCO1FBQ2hDLHFCQUFxQixFQUFFLHVCQUF1QjtRQUM5QyxrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsVUFBVSxFQUFFLFlBQVk7UUFDeEIsaUJBQWlCLEVBQUUsbUJBQW1CO1FBQ3RDLFlBQVksRUFBRSxjQUFjO1FBQzVCLFVBQVUsRUFBRSxZQUFZO1FBQ3hCLGlCQUFpQixFQUFFLG1CQUFtQjtRQUN0QyxhQUFhLEVBQUUsZUFBZTtRQUM5QixXQUFXLEVBQUUsYUFBYTtRQUMxQixhQUFhLEVBQUUsZUFBZTtRQUM5QixlQUFlLEVBQUUsaUJBQWlCO1FBQ2xDLGFBQWEsRUFBRSxlQUFlO1FBQzlCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLE1BQU0sRUFBRSxRQUFRO1FBQ2hCLGFBQWEsRUFBRSxlQUFlO1FBQzlCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFdBQVcsRUFBRSxhQUFhO1FBQzFCLGtCQUFrQixFQUFFLG9CQUFvQjtRQUN4QyxRQUFRLEVBQUUsVUFBVTtRQUNwQixjQUFjLEVBQUUsZ0JBQWdCO1FBQ2hDLG1CQUFtQixFQUFFLHFCQUFxQjtRQUMxQyxjQUFjLEVBQUUsZ0JBQWdCO1FBQ2hDLGtCQUFrQixFQUFFLG9CQUFvQjtLQUMzQyxDQUFDO0lBRUYsa0JBQWUsUUFBUSxDQUFDOzs7OztJQ3BEeEIsTUFBcUIsWUFBWTtRQVM3QixZQUNjLEdBQVEsRUFDVixpQkFBb0MsRUFDcEMsT0FBZ0I7WUFGZCxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQUNwQyxZQUFPLEdBQVAsT0FBTyxDQUFTO1lBWHBCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUNqQywwRkFBMEY7WUFDMUYsOEdBQThHO1lBRXZHLG1CQUFjLEdBQUcsSUFBSSxtQkFBUyxFQUFjLENBQUM7WUFxTjVDLFdBQU0sR0FBRyxHQUFHLEVBQUU7Z0JBQ2xCLE9BQU8sc0NBQXNDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUNqRSx1Q0FBdUM7b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNqQyx1Q0FBdUM7b0JBQ3ZDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUMxQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFBO1FBdk5HLENBQUM7UUFFRSxjQUFjLENBQUMsUUFBZ0I7WUFDbEMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFUyxZQUFZLENBQUMsT0FBZSxFQUFFLEtBQWEsRUFBRSxHQUFXO1lBQzlELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDaEQsT0FBTztZQUNYLENBQUM7WUFDRCxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVTLG1CQUFtQixDQUFDLE9BQWUsRUFBRSxLQUFhLEVBQUUsR0FBVztZQUNyRSxxR0FBcUc7WUFDckcsd0ZBQXdGO1lBQ3hGLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUNsRCxNQUFNLENBQUMsSUFBa0IsQ0FBQyxVQUFVLENBQWdCLGtCQUFRLENBQUMsYUFBYSxDQUFDO2lCQUN2RSxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRSxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRVMsaUJBQWlCLENBQUMsT0FBZTtZQUN2QyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDOUMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFBRSxPQUFPLEtBQUssQ0FBQztZQUMzQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDMUIsQ0FBQztRQUVTLG9CQUFvQixDQUFDLE9BQWU7WUFDMUMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JFLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQUUsT0FBTyxPQUFPLENBQUM7WUFDbEQsT0FBTyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNO2dCQUFFLE9BQU8sT0FBTyxDQUFDO1lBQ2xELE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFUyxtQkFBbUIsQ0FBQyxPQUFlLEVBQUUsR0FBVyxFQUFFLFFBQW1CO1lBQzNFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDbkQsQ0FBQztpQkFBTSxJQUFJLE9BQU8sQ0FBQyx1REFBdUQsQ0FBQyxFQUFFLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7UUFFTyxRQUFRLENBQUMsS0FBd0I7WUFDckMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQUMsT0FBTyxJQUFJLENBQUM7WUFBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzdCLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQzVDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2QyxJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxJQUFJLFNBQVM7Z0JBQ3ZDLEdBQUcsR0FBRyxPQUFPLENBQUM7WUFDbEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDeEUsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLEVBQUUsQ0FDTCxRQUFnQixFQUNoQixVQUFrQixJQUFJLEVBQ3RCLFNBQWtCLEtBQUssRUFDdkIsYUFBc0IsS0FBSyxFQUMzQixZQUFZLEdBQUcsSUFBSSxFQUNuQixVQUEwQyxFQUMxQyxVQUFtQixFQUNuQixRQUFpQjtZQUdqQixJQUFJLENBQUMsT0FBTztnQkFBRSxPQUFPLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFakosSUFBSSxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksSUFBSSxZQUFZLElBQUksU0FBUyxJQUFJLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDekssT0FBTztZQUNYLENBQUM7WUFFRCxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBSyxNQUFNLENBQUM7WUFDekQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFM0QsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyRCxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7WUFDOUIsb0RBQW9EO1lBRXBELE1BQU0sY0FBYyxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUM3QyxxQkFBcUI7WUFDckIscUJBQXFCO1lBQ3JCLG1EQUFtRDtZQUNuRCwyQ0FBMkM7WUFDM0MsSUFBSTtZQUVKLElBQUksZUFBZSxDQUFDO1lBQ3BCLElBQUksVUFBVSxFQUFFLENBQUM7Z0JBQ2IsZUFBZSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUM5QyxDQUFDO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRWhDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuRCxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDeEIsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3ZDLE9BQU8sQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFFckMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDekMsQ0FBQztZQUVELENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0gsR0FBRztnQkFDSCxJQUFJLEVBQUUsS0FBSztnQkFDWCxTQUFTLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFO2dCQUNwQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDbEIsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7d0JBQ3JCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2xDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzs0QkFDL0IsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTs0QkFDbkQsSUFBSSxPQUFPLElBQUksY0FBYyxFQUFFLENBQUM7Z0NBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0NBQzVELE9BQU87NEJBQ1gsQ0FBQzs0QkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dDQUNqQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQ0FDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxREFBcUQsR0FBRyxJQUFJLENBQUMsQ0FBQztvQ0FDMUUsT0FBTztnQ0FDWCxDQUFDOzRCQUNMLENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO29CQUVELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDdkQsSUFBSSxLQUFLLElBQUksU0FBUyxJQUFJLEtBQUssSUFBSSxJQUFJO3dCQUNuQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBRXhDLElBQUksQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDO3dCQUN6RSxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO3dCQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksR0FBRyxDQUFDO3dCQUd0RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUMxRSxNQUFNLHVCQUF1QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3dCQUVwSSxNQUFNLFVBQVUsR0FBRyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3hELE1BQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxNQUFNLFdBQVcsR0FBRyx1QkFBdUIsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFFbkYsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxXQUFXLEdBQUcsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVuSCxJQUFJLFlBQVksSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDOzRCQUU1SCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsV0FBVyxHQUFHLEdBQUcsQ0FBQyxDQUFDOzRCQUMxTixNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxlQUFlLENBQUM7NEJBQzdGLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbEQsQ0FBQztvQkFDTCxDQUFDO3lCQUNJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDZixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQ3RCLElBQUksWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7NEJBRXBDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxHQUFHLENBQUM7NEJBQ3hELElBQUksQ0FBQztnQ0FDRCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7NEJBQ2xELENBQUM7NEJBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQ0FDYixVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsS0FBSyxHQUFHLFVBQVUsQ0FBQyxDQUFDO2dDQUNoRixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7NEJBQ2xELENBQUM7d0JBQ0wsQ0FBQztvQkFDTCxDQUFDO3lCQUFNLENBQUM7d0JBQ0osSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQ2xELENBQUM7b0JBRUQscURBQXFEO29CQUNyRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO29CQUUvQixJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2xILElBQUksVUFBVSxFQUFFLENBQUM7d0JBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztvQkFBQyxDQUFDO29CQUUzRCxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckIsQ0FBQztnQkFFTCxDQUFDO2dCQUNELEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUNoQixJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNiLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdEIsQ0FBQztvQkFDRCxJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssY0FBYyxFQUFFLENBQUM7d0JBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNyRCxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ3BCLElBQUksT0FBTyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQ3hDLENBQUM7Z0JBQ0wsQ0FBQzthQUNKLENBQUMsQ0FBQztZQUNILE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7S0FXSjtJQXJPRCwrQkFxT0M7Ozs7O0lDN09ELE1BQXFCLEtBQUs7UUFFZixXQUFXO1lBQ2QsSUFBSSxDQUFDLEdBQVEsTUFBTSxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFZLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVNLEtBQUssQ0FBQyxJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQW1CO1lBRTFELElBQUksSUFBSSxLQUFLLFNBQVM7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRW5CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1FBQ0wsQ0FBQztRQUVNLE9BQU8sQ0FBQyxJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQW1CO1lBRTVELElBQUksSUFBSSxLQUFLLFNBQVM7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRW5CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDNUMsQ0FBQztpQkFDSSxDQUFDO2dCQUNGLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDdEMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1FBQ0wsQ0FBQztRQUVNLGtCQUFrQixDQUFDLE9BQWUsRUFBRSxLQUFjO1lBQ3JELFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUM7S0FDSjtJQXhDRCx3QkF3Q0M7Ozs7O0lDdENELE1BQXFCLE1BQU07UUFDdkIsMERBQTBEO1FBRW5ELGFBQWEsQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9FLE9BQU8sQ0FBQyxhQUFxQjtZQUNqQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakMsQ0FBQztRQUVNLGFBQWEsQ0FBQyxTQUFpQixFQUFFLEtBQUs7WUFFekMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUVsQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNwQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hHLENBQUM7WUFFTCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2hELENBQUM7UUFDTCxDQUFDO0tBQ0o7SUF2QkQseUJBdUJDOzs7Ozs7SUNwQkQsTUFBYSxXQUFXO1FBTXBCLFlBQ1ksR0FBUSxFQUNSLFlBQTBCLEVBQzFCLGlCQUFvQztZQUZwQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDMUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtZQVJ6QyxZQUFPLEdBQVEsSUFBSSxDQUFDO1lBQ3BCLGlCQUFZLEdBQVUsSUFBSSxDQUFDO1lBQzNCLGdCQUFXLEdBQVksS0FBSyxDQUFDO1lBQzdCLG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBTW5DLENBQUM7UUFFRSxVQUFVLENBQUMsUUFBZ0I7WUFDOUIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUMxRCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRWIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztxQkFBTSxDQUFDO29CQUNKLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVNLFVBQVU7WUFFYiwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RSwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUU1RCxJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBRTVFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFO2dCQUNsQixJQUFJLENBQUM7b0JBQ0QsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7d0JBQUMsT0FBTyxJQUFJLENBQUM7b0JBQUMsQ0FBQztvQkFDdEMsT0FBTyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDaEMsd0NBQXdDO2dCQUM1QyxDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1QsT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7WUFDTCxDQUFDLENBQUM7UUFDTixDQUFDO1FBRU8sT0FBTztZQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQUMsMEJBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRWIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVNLEtBQUs7WUFDUixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztZQUUzQixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRW5DLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNmLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDMUQsQ0FBQztnQkFFRCxNQUFNLGNBQWMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUM5RSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN0QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDcEIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQzdCLENBQUM7WUFDTCxDQUFDO1lBRUQsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDbEIsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7WUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFFekIsNEJBQTRCO1lBQzVCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDckUsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUUzRCxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQzlCLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO29CQUNoQyxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRixJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqRixDQUFDO1lBQ0wsQ0FBQztZQUdELElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM1QixXQUFXLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxDQUFDO1lBRUQsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUN2QyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2pELENBQUM7WUFFRCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU8sZUFBZSxDQUFDLEdBQVE7WUFDNUIsSUFBSSxDQUFDO2dCQUNELE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBb0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2xGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUFDLE9BQU87Z0JBQUMsQ0FBQztnQkFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsdUJBQXVCO1lBQzNELENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekIsQ0FBQztRQUNMLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxRQUFnQjtZQUN0QyxRQUFRLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFFTyxZQUFZO1lBQ2hCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVNLFlBQVksQ0FBQyxRQUFpQjtZQUNqQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUVuQiwwQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFtQixFQUM5QztvQkFDSSxHQUFHLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO29CQUN6QixNQUFNLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO2lCQUN2RCxDQUFDLENBQUM7WUFDWCxDQUFDO1FBQ0wsQ0FBQztRQUVNLGlCQUFpQixDQUFDLE1BQVc7WUFDaEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUV4RixJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEIsT0FBTztZQUNYLENBQUM7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztZQUNoSCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTyxjQUFjO1lBQ2xCLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQ2hELENBQUM7UUFDTCxDQUFDO1FBRU0sY0FBYztZQUNqQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QixDQUFDO1FBQ0wsQ0FBQztRQUVNLFNBQVMsQ0FBQyxHQUFXLEVBQUUsU0FBa0IsS0FBSztZQUVqRCxJQUFJLFdBQVcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdFLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFM0QsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzVCLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sU0FBUyxHQUFhLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxHQUFHLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixDQUFDO1lBRUQsSUFBSSxRQUFRLEdBQVcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRXpGLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQ1QsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDOUQsQ0FBQztZQUVELElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFFOUIsSUFBSSxVQUFVLElBQUksSUFBSSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxNQUFNLEVBQUUsQ0FBQztvQkFDVCxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEUsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVNLGtCQUFrQjtZQUNyQixPQUFPLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVNLElBQUksQ0FBQyxLQUF5QixFQUFFLEdBQVksRUFBRSxPQUFhO1lBQzlELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3RSxDQUFDO1FBRU0sVUFBVSxDQUFDLEtBQXlCLEVBQUUsR0FBWSxFQUFFLE9BQWE7WUFDcEUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25GLENBQUM7UUFFTSxlQUFlLENBQUMsS0FBeUIsRUFBRSxVQUFtQixFQUFDLFdBQW9CLEVBQUUsT0FBYTtZQUNyRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNySCxDQUFDO1FBRVMsV0FBVztZQUVqQixjQUFjO1lBQ2QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDM0QsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3JDLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPO1lBQ1gsQ0FBQztZQUVELDJCQUEyQjtZQUMzQixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBRTlFLElBQUksV0FBVyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFDL0MsSUFBSSxlQUFlLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFFM0QsSUFBSSxXQUFXLEtBQUssZUFBZSxFQUFFLENBQUM7b0JBQ2xDLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO29CQUM5RCxPQUFPO2dCQUNYLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdEcsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hHLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUFqUEQsa0NBaVBDO0lBRUQsTUFBcUIsS0FBSztRQVF0QixZQUNZLFVBQWUsRUFDZixZQUEwQixFQUMxQixNQUFtQixFQUMzQixLQUF5QixFQUN6QixTQUFrQixFQUNsQixHQUFTO1lBTEQsZUFBVSxHQUFWLFVBQVUsQ0FBSztZQUNmLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLFdBQU0sR0FBTixNQUFNLENBQWE7WUFWeEIsY0FBUyxHQUFZLEtBQUssQ0FBQztZQUkxQixpQkFBWSxHQUFRLEVBQUUsQ0FBQztZQVczQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNyRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUVsRSxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEYsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFBQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7WUFBQyxDQUFDO1FBQ2pFLENBQUM7UUFDTSxVQUFVLENBQUMsT0FBZ0I7UUFFbEMsQ0FBQztRQUNNLE9BQU87WUFDVixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUNNLElBQUksQ0FBQyxZQUFxQixJQUFJO1lBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUMvQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUFDLE9BQU8sS0FBSyxDQUFDO2dCQUFDLENBQUM7WUFBQyxDQUFDO1lBRWpGLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRTVDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDbkMsSUFBSSxFQUNKLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUN2QixTQUFTLEVBQ1QsQ0FBQyxPQUFnQixFQUFFLEVBQUU7Z0JBQ2pCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTO29CQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixJQUFJLFNBQVMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQztvQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFUCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ3BELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDZixPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCwwQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sVUFBVSxDQUFDLFlBQXFCLElBQUk7WUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUFDLE9BQU8sS0FBSyxDQUFDO2dCQUFDLENBQUM7WUFDeEQsQ0FBQztZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBRTVDLDhEQUE4RDtZQUM5RCwrQ0FBK0M7WUFDL0MsSUFBSTtZQUVKLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBRXJCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZCLElBQUksU0FBUyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUNELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQywwQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxlQUFlLENBQUMsVUFBaUIsRUFBRSxXQUFrQjtZQUN4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDaEMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQUMsT0FBTyxLQUFLLENBQUM7Z0JBQUMsQ0FBQztZQUN4RCxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNoRixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7WUFDaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFNUMsSUFBRyxVQUFVLEVBQUMsQ0FBQztnQkFDWCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDM0IsQ0FBQztZQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxRCxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTVCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXZCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtnQkFDM0MsMEJBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ25CLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNwQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQy9CLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7Z0JBQ3hDLENBQUM7WUFDTCxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVTLHVCQUF1QixDQUFDLE9BQVk7WUFDMUMsSUFBSSxnQkFBZ0IsR0FBVyxFQUFFLENBQUM7WUFDbEMsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7WUFFNUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDbkIsZ0JBQWdCLElBQUksV0FBVyxDQUFDO29CQUNoQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssTUFBTSxFQUFFLENBQUM7d0JBQzlELGdCQUFnQixJQUFJLFNBQVMsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDO29CQUNyRCxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hCLGdCQUFnQixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLG9CQUFvQixDQUFDO2dCQUN4RSxDQUFDO3FCQUNJLENBQUM7b0JBQ0YsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ25CLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxNQUFNLEVBQUUsQ0FBQzs0QkFDOUQsZ0JBQWdCLElBQUksNkJBQTZCLENBQUM7d0JBQ3RELENBQUM7NkJBQ0ksSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDOzRCQUNuRSxnQkFBZ0IsSUFBSSw4QkFBOEIsQ0FBQzt3QkFDdkQsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pCLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO3dCQUNwRCxnQkFBZ0IsSUFBSSxPQUFPLEdBQUcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQztvQkFDL0csQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLGdCQUFnQixJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztvQkFDekQsQ0FBQztnQkFDTCxDQUFDO3FCQUNJLElBQUksT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUN4QixJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFLENBQUM7d0JBQzdCLGdCQUFnQixJQUFJLGFBQWEsQ0FBQztvQkFDdEMsQ0FBQzt5QkFDSSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7d0JBQ3JDLGdCQUFnQixJQUFJLHFCQUFxQixDQUFDO29CQUM5QyxDQUFDO2dCQUNMLENBQUM7Z0JBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3hCLGtCQUFrQixJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUM7Z0JBQ2hELENBQUM7WUFDTCxDQUFDO1lBRUQsT0FBTyxDQUFDLHFCQUFxQixrQkFBa0I7O3dEQUVDLGdCQUFnQjs7Ozs7Ozs7Ozt3Q0FVaEMsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFUyx5QkFBeUIsQ0FBQyxPQUFZO1lBRTVDLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzFCLElBQUksV0FBVyxHQUFHLHVCQUF1QixDQUFDO1lBQzFDLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBRTFCLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hCLGdCQUFnQixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztnQkFDdkQsQ0FBQztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDakIsZ0JBQWdCLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO29CQUNyRCxXQUFXLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO29CQUNoRCxnQkFBZ0IsSUFBSSxrQ0FBa0MsQ0FBQztnQkFDM0QsQ0FBQztZQUNMLENBQUM7WUFFRCxPQUFPOztzREFFdUMsR0FBRyxnQkFBZ0IsR0FBRzs7Ozs7Ozs7O2dDQVM1QyxHQUFHLFdBQVcsR0FBRyxJQUFJLEdBQUcsZ0JBQWdCLEdBQUc7OzJCQUVoRCxDQUFDO1FBQ3hCLENBQUM7UUFFUyw4QkFBOEIsQ0FBQyxPQUFZO1lBRWpELElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzFCLElBQUksY0FBYyxHQUFHLHVCQUF1QixDQUFDO1lBQzdDLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hCLGdCQUFnQixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztnQkFDdkQsQ0FBQztnQkFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztvQkFDakIsZ0JBQWdCLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO29CQUNyRCxjQUFjLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN2RCxDQUFDO1lBQ0wsQ0FBQztZQUVELE9BQU87O3NEQUV1QyxHQUFHLGdCQUFnQixHQUFHOzs7Ozs7Ozs0Q0FRaEMsR0FBRyxjQUFjLEdBQUc7OzJCQUVyQyxDQUFDO1FBQ3hCLENBQUM7S0FDSjtJQXpRRCx3QkF5UUM7Ozs7O0lDNWZELE1BQXFCLFFBQVE7UUFJekIsWUFBb0IsS0FBWSxFQUFVLGlCQUFvQztZQUExRCxVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUFJLENBQUM7UUFFNUUsU0FBUztZQUVaLE1BQU0sT0FBTyxHQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO1lBRXpDLE1BQU0sTUFBTSxHQUFHLGdCQUFNLENBQUMsV0FBVyxDQUFDO1lBRWxDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsVUFBVSxLQUFLLEVBQUUsT0FBTztnQkFDbkMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQUMsT0FBTyxJQUFJLENBQUM7Z0JBQUMsQ0FBQztnQkFDNUMsT0FBTyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNDLENBQUMsQ0FBQztZQUVGLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUM1QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDdEMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3RDLE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUUxQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVyRSxPQUFPLENBQUMsTUFBTSxHQUFHLFVBQVUsS0FBYSxFQUFFLE9BQVk7Z0JBQ2xELE9BQU8sb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDM0QsQ0FBQyxDQUFDO1lBRUYsT0FBTyxDQUFDLEdBQUcsR0FBRyxVQUFVLEtBQWEsRUFBRSxPQUFZLEVBQUUsS0FBVTtnQkFDM0QsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsRixDQUFDLENBQUM7WUFFRixPQUFPLENBQUMsR0FBRyxHQUFHLFVBQVUsS0FBYSxFQUFFLE9BQVksRUFBRSxLQUFVO2dCQUMzRCxPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQztZQUVGLE9BQU8sQ0FBQyxLQUFLLEdBQUcsVUFBVSxLQUFhLEVBQUUsT0FBWSxFQUFFLEtBQVU7Z0JBQzdELE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDO1lBRUYsdUJBQXVCO1FBQzNCLENBQUM7UUFFTSxVQUFVO1lBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNHLENBQUM7UUFFRCw0REFBNEQ7UUFDckQsaUJBQWlCLENBQUMsT0FBc0I7WUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO1lBQ3hGLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLENBQUM7UUFFTSxZQUFZLENBQUMsT0FBZTtZQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUFDLE9BQU8sSUFBSSxDQUFDO1lBQUMsQ0FBQztZQUVwRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBRW5ELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFFakQsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTSxXQUFXLENBQUMsSUFBWTtZQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBQ2pFLHVDQUF1QztRQUMzQyxDQUFDO1FBRU0sdUJBQXVCLENBQUMsTUFBYztZQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUMvQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBRTVDLENBQUMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVTLGVBQWUsQ0FBQyxPQUFlO1lBQ3JDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVTLE9BQU8sQ0FBQyxPQUFlO1lBQzdCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRVMsWUFBWSxDQUFDLE9BQWUsRUFBRSxJQUFZO1lBQ2hELE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFUyx1QkFBdUIsQ0FBQyxTQUFvQixFQUFFLE9BQWU7WUFDbkUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUN6QixlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTthQUNsRCxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsY0FBYyxDQUFDLFNBQW9CLEVBQUUsSUFBWSxFQUFFLE9BQWU7WUFDeEUsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzdCLENBQUM7UUFFUyxvQkFBb0IsQ0FBQyxTQUFvQjtZQUMvQyxJQUFJLFlBQVksR0FBVyxFQUFFLENBQUM7WUFFOUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNwQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDbEQsWUFBWSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUMzQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1QyxDQUFDO1FBQ0wsQ0FBQztRQUVTLHFCQUFxQixDQUFDLFNBQW9CLEVBQUUsSUFBWSxFQUFFLE9BQWU7WUFDL0UsTUFBTSxZQUFZLEdBQVEsS0FBSyxDQUFDO1lBQ2hDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xELFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDbkUsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLENBQUM7UUFDTCxDQUFDO1FBRVMsaUJBQWlCLENBQUMsU0FBb0IsRUFBRSxJQUFZLEVBQUUsT0FBZTtZQUMzRSxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDSjtJQXBJRCwyQkFvSUM7Ozs7O0lDcElELE1BQXFCLElBQUk7UUFFckIsWUFDWSxHQUFRLEVBQ1IsUUFBa0IsRUFDbEIsT0FBZ0IsRUFDaEIsWUFBMEI7WUFIMUIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLGFBQVEsR0FBUixRQUFRLENBQVU7WUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUNoQixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUc1Qiw4QkFBeUIsR0FBbUIsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUZ2RixDQUFDO1FBSUUsMkJBQTJCLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUMsRUFBRSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFOUosd0JBQXdCLENBQUMsUUFBZ0I7WUFDNUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztpQkFDOUIsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVNLG9CQUFvQixDQUFDLFFBQWdCO1lBQ3hDLFFBQVEsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsSUFBWTtZQUNqQyxNQUFNLE1BQU0sR0FBa0MsRUFBRSxDQUFDO1lBRWpELE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRW5FLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUVwQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUUxQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBRXhFLE1BQU0sYUFBYSxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFDMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEYsS0FBSyxNQUFNLENBQUMsSUFBSSxhQUFhLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFL0IsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUM7d0JBQUMsU0FBUztvQkFBQyxDQUFDO29CQUVoRCxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO29CQUMxQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFaEUsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7d0JBQUMsU0FBUztvQkFBQyxDQUFDO29CQUV4RCxxQkFBcUI7b0JBQ3JCLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQy9DLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDM0MsQ0FBQztvQkFFRCwwQkFBMEI7b0JBQzFCLElBQUksQ0FBQyxDQUFDLGNBQWMsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTzsyQkFDakcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFPLENBQUMsRUFBRSxDQUFDO3dCQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFBQyxDQUFDO29CQUN6RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7WUFDTCxDQUFDO1lBRUQsd0JBQXdCO1lBQ3hCLCtFQUErRTtZQUMvRSx5REFBeUQ7WUFDekQsQ0FBQyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDdEMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDcEQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFUyxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLE1BQWdCO1lBQzdELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFTSxTQUFTLENBQUMsR0FBRztZQUNoQixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMscURBQXFELEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVNLFdBQVcsQ0FBQyxPQUFlO1lBQzlCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQ3hFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QyxrREFBa0Q7WUFDbEQsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFELElBQUksZ0JBQWdCLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDTixJQUFJLEVBQUUsY0FBYztvQkFDcEIsS0FBSyxFQUFFLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQzt5QkFDcEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRTtpQkFDaEUsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwRixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU8scUJBQXFCLENBQUMsS0FBd0I7WUFDbEQsSUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsY0FBYztnQkFDM0YsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQztnQkFBQyxDQUFDLENBQUMsV0FBVztnQkFDOUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxLQUFLLENBQUM7WUFDakIsQ0FBQztpQkFBTSxDQUFDO2dCQUFDLE9BQU8sSUFBSSxDQUFDO1lBQUMsQ0FBQztRQUMzQixDQUFDO1FBRU8sa0JBQWtCLENBQUMsS0FBYTtZQUNwQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBcUIsQ0FBQztZQUNwRCxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVPLGNBQWMsQ0FBQyxLQUF3QjtZQUMzQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3BDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7Z0JBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFBQyxPQUFPLEtBQUssQ0FBQztZQUFDLENBQUM7WUFFdEYsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyw0QkFBNEIsQ0FBQyxDQUFDO1lBRTFHLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBRTNELElBQUksQ0FBQztnQkFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFM0csS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDMUIsSUFBSSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUMzQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3RELENBQUM7Z0JBRUQsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRXZDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3BDLElBQUksSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7d0JBQ3BDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBQzFDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztvQkFDekYsQ0FBQzt5QkFDSSxDQUFDO3dCQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDeEQsQ0FBQztnQkFDTCxDQUFDO3FCQUFNLENBQUM7b0JBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQUMsQ0FBQztZQUNuQyxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakIsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7S0FDSjtJQXJKRCx1QkFxSkM7Ozs7O0lDaEpELE1BQXFCLGNBQWM7UUFFL0IsWUFBb0IsS0FBWSxFQUNwQixJQUFVLEVBQ1YsT0FBZ0IsRUFDaEIsWUFBMEIsRUFDMUIsaUJBQW9DLEVBQ3BDLE1BQWMsRUFDZCxXQUF3QixFQUN4QixhQUE0QixFQUM1QixjQUErQjtZQVJ2QixVQUFLLEdBQUwsS0FBSyxDQUFPO1lBQ3BCLFNBQUksR0FBSixJQUFJLENBQU07WUFDVixZQUFPLEdBQVAsT0FBTyxDQUFTO1lBQ2hCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFDcEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtZQUNkLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBQzVCLG1CQUFjLEdBQWQsY0FBYyxDQUFpQjtRQUFJLENBQUM7UUFFekMsVUFBVTtZQUNiLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM1RyxDQUFDO1FBRU0sVUFBVSxDQUFDLFlBQW9CLElBQUksRUFBRSxVQUFlLElBQUksRUFBRSxRQUFnQixNQUFNO1lBQ25GLElBQUksU0FBUyxJQUFJLElBQUk7Z0JBQUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxJQUFJLE9BQU8sSUFBSSxJQUFJO2dCQUFFLE9BQU8sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLENBQUMsQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQy9ELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLCtGQUErRjtvQkFDL0YsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM5RCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7b0JBQ3JCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFO3dCQUNwQixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNoRSxDQUFDLENBQUMsQ0FBQztvQkFDSCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7b0JBQ3hCLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFO3dCQUMzQixZQUFZLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsWUFBWSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO29CQUVoRCxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO29CQUM5QixJQUFJLFVBQVUsSUFBSSxTQUFTLElBQUksVUFBVSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7d0JBQ3hGLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyw0RUFBNEUsQ0FBQyxFQUFFLENBQUM7NEJBQ3RHLFlBQVksR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDekQsQ0FBQztvQkFDTCxDQUFDO29CQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQy9CLENBQUM7WUFFTCxDQUFDLENBQUMsQ0FBQztZQUVILEtBQUssSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLO29CQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNsRyxDQUFDO1FBQ0wsQ0FBQztRQUVNLE1BQU0sQ0FBQyxPQUFZLEVBQUUsVUFBZSxJQUFJO1lBQzNDLEtBQUssSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7b0JBQUUsT0FBTztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztRQUVPLEdBQUcsQ0FBQyxNQUFXLEVBQUUsT0FBWTtZQUNqQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO2dCQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUNsRSxJQUFJLE1BQU0sQ0FBQyxNQUFNO2dCQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3ZDLElBQUksTUFBTSxDQUFDLHVCQUF1QjtnQkFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzdKLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNFLENBQUM7aUJBQ0ksSUFBSSxNQUFNLENBQUMsVUFBVTtnQkFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzlGLElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxNQUFNO2dCQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQzFELElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLEtBQUs7b0JBQUUsT0FBTyxLQUFLLENBQUM7WUFBQyxDQUFDO2lCQUN0RyxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksd0JBQXdCLEVBQUUsQ0FBQztnQkFDeEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUNsRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLEtBQUs7b0JBQUUsT0FBTyxLQUFLLENBQUM7Z0JBQ3hELElBQUksTUFBTSxFQUFFLENBQUM7b0JBQ1QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN6RCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO3dCQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3BILENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7cUJBQ0ksQ0FBQztvQkFDRiwwQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO1lBQ0wsQ0FBQztpQkFDSSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUkseUJBQXlCLEVBQUUsQ0FBQztnQkFDekQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzVCLDBCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbkQsQ0FBQztpQkFDSSxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksT0FBTztnQkFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3BELElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxTQUFTO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQzdELElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxPQUFPO2dCQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDcEQsSUFBSSxNQUFNLENBQUMsYUFBYSxJQUFJLGdCQUFnQjtnQkFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3BGLElBQUksTUFBTSxDQUFDLGFBQWE7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hGLElBQUksTUFBTSxDQUFDLFFBQVE7Z0JBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3RELElBQUksTUFBTSxDQUFDLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7O2dCQUNwRCxLQUFLLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1lBRS9FLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFFTyxNQUFNLENBQUMsTUFBVyxFQUFFLE9BQVk7WUFDcEMsSUFBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbkYsT0FBTztZQUNYLENBQUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksS0FBSztnQkFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Z0JBQzFELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFUyxRQUFRLENBQUMsTUFBVyxFQUFFLE9BQVk7WUFDeEMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDekUsTUFBTSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUM1QyxJQUFJLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztpQkFDcEYsSUFBSSxNQUFNLENBQUMsTUFBTSxJQUFJLFFBQVE7Z0JBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNqRyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtnQkFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEUsQ0FBQztpQkFDSSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxFQUFFO2dCQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3RGLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxLQUFLO2dCQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNqRSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2xGLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLElBQUksSUFBSSxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ3BDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQzFDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQ3hHLENBQUM7cUJBQ0ksQ0FBQztvQkFDRixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUN2RSxDQUFDO1lBQ0wsQ0FBQzs7Z0JBQ0ksUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVPLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBSSxFQUFFLE9BQVE7WUFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBRU8sb0JBQW9CLENBQUMsS0FBSyxFQUFFLFVBQVcsRUFBRSxXQUFZLEVBQUUsT0FBUTtZQUNuRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3pCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRU8sYUFBYSxDQUFDLEtBQUssRUFBRSxHQUFJO1lBQzdCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVPLDZCQUE2QixDQUFDLHVCQUErQixFQUFFLEdBQVcsRUFBRSxJQUFZLEVBQUUsSUFBUztZQUNqRyxNQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsdUJBQXVCLENBQUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTyxXQUFXLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxJQUFTO1lBQ3BELGlFQUFpRTtZQUNqRSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBTSxHQUFHLENBQUMsQ0FBQTtZQUNwRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztLQUNKO0lBL0pELGlDQStKQzs7Ozs7SUNsS0QsTUFBcUIsYUFBYTtRQUc5QixZQUNZLEdBQVEsRUFDUixRQUFrQixFQUNsQixPQUFnQixFQUNoQixJQUFVLEVBQ1YsaUJBQW9DO1lBSnBDLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2xCLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDaEIsU0FBSSxHQUFKLElBQUksQ0FBTTtZQUNWLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFQekMsMkJBQXNCLEdBQUcsS0FBSyxDQUFDO1lBNkovQix3QkFBbUIsR0FBRyxDQUFDLEtBQWdCLEVBQUUsTUFBYyxFQUFFLEtBQWEsRUFBRSxFQUFFO2dCQUM3RSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVwQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsWUFBWSxDQUFDO2dCQUU5QixJQUFJLElBQUksRUFBRSxDQUFDO29CQUNQLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUM3QixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6QixDQUFDO3lCQUNJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO3dCQUNsQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUMvQixJQUFJLElBQUksQ0FBQyxNQUFNOzRCQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OzRCQUN0QyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QixDQUFDOzt3QkFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7cUJBQ0ksSUFBSSxLQUFLO29CQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs7b0JBQ3hCLEtBQUssQ0FBQywwQkFBMEIsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUE7WUFFUyxtQkFBYyxHQUFHLEdBQUcsRUFBRTtnQkFDNUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUVyQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7a0ZBVXVELENBQUM7cUJBQ3RFLE1BQU0sQ0FBQyxDQUFDLENBQUMseUNBQXlDLENBQUM7cUJBQy9DLE1BQU0sQ0FBQyxDQUFDLENBQUMsOENBQThDLENBQUM7cUJBQ3BELE1BQU0sQ0FBQyxDQUFDLENBQUM7Ozs7OztvR0FNc0UsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRTVCLENBQUMsQ0FBQTtZQUVTLHFCQUFnQixHQUFHLEdBQUcsRUFBRTtnQkFFOUIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3hCLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQztZQUNMLENBQUMsQ0FBQTtRQTVNRyxDQUFDO1FBRUUsb0JBQW9CLENBQUMsUUFBZ0IsRUFBRSxLQUFhLEVBQUUsUUFBZ0I7WUFDekUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUN4QixDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNGLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDekUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakksY0FBYyxDQUFDLEtBQUs7WUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyQyxJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksZUFBZSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLO2dCQUFFLE9BQU8sS0FBSyxDQUFDO1lBRTdGLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM3RSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFFbEUsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJO2dCQUNqQixDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNsQyxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sZ0JBQWdCLENBQUMsU0FBaUI7WUFDdEMsSUFBSSxDQUFDO2dCQUNELElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQztnQkFFL0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQzNDLElBQUksTUFBTSxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFN0MsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQzNCLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3pDLFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDM0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRUQsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBRS9CLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBRTFCLENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxTQUFTLENBQUM7WUFDckIsQ0FBQztRQUNMLENBQUM7UUFFTSxjQUFjLENBQUMsS0FBd0IsRUFBRSxTQUFpQixFQUFFLFFBQVEsR0FBRyxLQUFLO1lBRS9FLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckMsSUFBSSxxQkFBcUIsR0FBVyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUNoRSxJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBRXZELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7Z0JBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFBQyxPQUFPLEtBQUssQ0FBQztZQUFDLENBQUM7WUFDeEYsSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6RCxJQUFJLFVBQVUsR0FBRyxnQkFBTSxDQUFDLDJCQUEyQixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRixJQUFJLFVBQVU7Z0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDckQsT0FBTyxDQUFDLFFBQVEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUM7WUFFbkMsSUFBSSxlQUFlLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMxQixDQUFDO1lBRUQsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRTlELGlGQUFpRjtZQUNqRixtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUU3RyxNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFFN0MsTUFBTSxPQUFPLEdBQXVCO2dCQUNoQyxPQUFPO2dCQUNQLGVBQWU7Z0JBQ2YsR0FBRyxFQUFFLFNBQVM7YUFDakIsQ0FBQztZQUVGLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRWxDLElBQUksU0FBUyxJQUFJLFNBQVMsSUFBSSxTQUFTLElBQUksSUFBSSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RKLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUVELENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ0gsR0FBRyxFQUFFLFNBQVM7Z0JBQ2QsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxNQUFNO2dCQUNoRCxTQUFTLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFO2dCQUNwQyxLQUFLLEVBQUUsQ0FBQyxRQUFRO2dCQUNoQixJQUFJLEVBQUUsbUJBQW1CO2dCQUN6QixPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDaEIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUN2QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNwQixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ25HLENBQUM7Z0JBQ0QsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUI7Z0JBQy9CLFVBQVUsRUFBRTtvQkFDUixHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDVixJQUFJLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLENBQUM7b0JBQ3RDLENBQUM7aUJBQ0o7Z0JBQ0QsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7b0JBQ1osSUFBSSxDQUFDLHNCQUFzQixHQUFHLEtBQUssQ0FBQztvQkFFcEMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBRXhCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBRTNDLE9BQU8sQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsQ0FBQztvQkFDN0MsSUFBSSxVQUFVO3dCQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBSy9DLElBQUksZUFBZSxHQUFXLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztvQkFFckcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQzVDLGtGQUFrRjt3QkFDbEYsZUFBZSxFQUFFLENBQUM7b0JBQ3RCLENBQUM7b0JBRUQsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO3dCQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQzdGLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBRXBDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQy9DLENBQUM7YUFDSixDQUFDLENBQUM7WUFFSCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRVMsWUFBWSxDQUFDLEtBQXdCLEVBQUUsT0FBMkI7UUFFNUUsQ0FBQztRQUVTLHFCQUFxQixDQUFDLEtBQXdCLEVBQUUsT0FBMkI7UUFFckYsQ0FBQztRQUVTLHFCQUFxQixDQUFDLEtBQXdCLEVBQUUsT0FBMkI7UUFFckYsQ0FBQztLQTBESjtJQXRORCxnQ0FzTkM7O0FBRUQsNktBQTZLO0FBQzdLLGdGQUFnRjtBQUNoRix1REFBdUQ7QUFDdkQsMExBQTBMO0FBQzFMLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2IsU0FBUzs7OztJQ2pPVCxNQUFxQixRQUFRO1FBQ3pCLFlBQ1ksV0FBd0IsRUFDeEIsYUFBNEIsRUFDNUIsWUFBMEI7WUFGMUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDNUIsaUJBQVksR0FBWixZQUFZLENBQWM7UUFBSSxDQUFDO1FBRXBDLFVBQVUsQ0FBQyxRQUFnQjtZQUM5QixRQUFRLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFTyxJQUFJLENBQUMsS0FBd0I7WUFDakMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekIsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxJQUFJLENBQUM7Z0JBQUUsT0FBTztZQUVsRCxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25DLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFcEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN6QyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7WUFFN0MsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEVBQUU7Z0JBQ3hCLGVBQWUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDakMsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQy9CLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQTtZQUVELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDckQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNuRyxDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuRyxDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBdkNELDJCQXVDQzs7Ozs7O0lDbENELG9DQU1DO0lBS0QsOEJBd0JDO0lBdUNELDhDQWtCQztJQXBHRCxNQUFNLDJCQUEyQixHQUFHLEdBQUcsRUFBRTtRQUNyQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU07WUFDMUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHdDQUF3QyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRixDQUFDLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUMsQ0FBQTtJQUNRLGtFQUEyQjtJQUVwQyxTQUFnQixZQUFZO1FBQ3hCLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMzQyxPQUFPO1lBQ0gsR0FBRyxFQUFFLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRTtZQUMvQyxJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFO1NBQ3JELENBQUM7SUFDTixDQUFDO0lBRUQsNERBQTREO0lBQzVELGtDQUFrQztJQUNsQywrQkFBK0I7SUFDL0IsU0FBZ0IsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQzlCLDBDQUEwQztRQUMxQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVsQixxREFBcUQ7UUFDckQseUJBQXlCO1FBQ3pCLElBQUksRUFBRSxHQUFRLENBQUMsQ0FBQztRQUVoQixvREFBb0Q7UUFDcEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1YsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEYsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDYixJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNsQyxxREFBcUQ7b0JBQ3JELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDN0IsMkJBQTJCO29CQUMzQixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ25DLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBRUYsbUNBQW1DO0lBQ25DLG1EQUFtRDtJQUNuRCw0RUFBNEU7SUFDNUUsb0ZBQW9GO0lBQ3BGLHNFQUFzRTtJQUN0RSw4RUFBOEU7SUFFOUUsZ0hBQWdIO0lBQ2hILHVIQUF1SDtJQUV2SCxvQkFBb0I7SUFDcEIsR0FBRztJQUVILE1BQU0sNkJBQTZCLEdBQUcsR0FBRyxFQUFFO1FBQ3ZDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUNuRSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDdkcsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUE7SUFDUSxzRUFBNkI7SUFFdEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFhLEVBQUUsS0FBVSxFQUFFLElBQVUsRUFBRSxFQUFFO1FBQ3pELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDcEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2pDLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzlCLElBQUksR0FBRyxLQUFLLEtBQUs7b0JBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDLENBQUE7SUFDUSxnQ0FBVTtJQUVuQixTQUFnQixpQkFBaUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUM7WUFBRSxNQUFNLHVCQUF1QixDQUFDO1FBQ3BELElBQUksSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDakIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUk7Z0JBQUUsTUFBTTtZQUVqQixJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzQixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3JDLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQztZQUNwRCxDQUFDO1lBQ0QsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkMsSUFBSSxHQUFHLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQzs7Ozs7SUNuR0QsTUFBcUIsZ0JBQWdCO1FBRTFCLE1BQU0sQ0FBQyxVQUFVO1lBQ3BCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUNoQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBRWhDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVwQixNQUFNLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUV2RixFQUFFLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztZQUNuQyxFQUFFLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztZQUVqQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDUixZQUFZLEVBQUUsRUFBRSxDQUFDLFlBQVk7Z0JBQzdCLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUztnQkFDdkIsa0JBQWtCO2dCQUNsQixVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVU7Z0JBQ3pCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUI7YUFDMUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQVksRUFBRSxjQUF3QjtZQUM5RCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBRTNCLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztpQkFDM0YsSUFBSSxjQUFjLENBQUMsTUFBTSxJQUFJLENBQUM7Z0JBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLGNBQWMsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7aUJBQzFGLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEdBQUcsSUFBSSxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFDLENBQUM7aUJBQ2xHLElBQUksY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQztRQUNqSCxDQUFDO1FBRU8sTUFBTSxDQUFDLFlBQVk7WUFFdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUMxQixDQUFDLFFBQWdCLEVBQUUsWUFBb0IsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQ3JELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUN6RCxPQUFPLFNBQVMsS0FBSyxDQUFDLENBQUMsSUFBSSxTQUFTLEtBQUssUUFBUSxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1lBRVAsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsR0FBUSxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDakQsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUN6QyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFcEcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUM1QixDQUFDLFFBQWdCLEVBQUUsTUFBYyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFaEgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQVksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUVwRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQzNCLENBQUMsUUFBUSxFQUFFLElBQVksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFDekIsQ0FBQyxRQUFRLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXBILElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJO1lBQ3pCLElBQUksQ0FBQztnQkFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2dCQUNoRCxNQUFNLEtBQUssQ0FBQztZQUNoQixDQUFDO1FBQ0wsQ0FBQztRQUVPLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRztZQUN2QixDQUFDLENBQUMscUVBQXFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBRU8sTUFBTSxDQUFDLE9BQU8sQ0FBSSxLQUFlLEVBQUUsYUFBMkM7WUFDbEYsSUFBSSxNQUFNLEdBQWtCLEVBQUUsQ0FBQztZQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2hCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFRLENBQUM7UUFDNUQsQ0FBQztLQUNKO0lBN0ZELG1DQTZGQzs7Ozs7SUN2RkQsTUFBcUIsT0FBTztRQUV4QixZQUNZLEdBQVEsRUFDUixhQUE0QjtZQUQ1QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1Isa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBSSxDQUFDO1FBRXRDLGNBQWMsQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxGLHdCQUF3QixDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV0RyxpQkFBaUIsQ0FBQyxRQUFnQjtZQUNyQyxRQUFRLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQztRQUVPLFdBQVcsQ0FBQyxLQUF3QjtZQUN4QyxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3RDLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEMsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRWQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDN0IsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUM7WUFFRCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN4QyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFBQyxJQUFJLElBQUksT0FBTyxDQUFDO1lBQUMsQ0FBQztZQUM5QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFFTSxrQkFBa0IsQ0FBQyxLQUFhO1lBRW5DLE1BQU0sV0FBVyxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUM3RixJQUFJLFdBQVcsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFBQyxPQUFPO1lBQUMsQ0FBQztZQUVuQyxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRXJFLE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxjQUFjLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRXhELElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxZQUFZLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzNDLFlBQVksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM3QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osWUFBWSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUM1QyxZQUFZLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUVELFlBQVksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUVPLFFBQVEsQ0FBQyxTQUFTO1lBRXRCLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQztZQUU3QixNQUFNLE1BQU0sR0FBRztnQkFDWCxNQUFNLEVBQUUsa0JBQWtCO2dCQUMxQixXQUFXLEVBQUUsUUFBUTtnQkFDckIsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLE1BQU0sRUFBRSxJQUFJO2dCQUNaLEtBQUssRUFBRSxhQUFhO2dCQUNwQixNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUU7b0JBQ2Qsa0NBQWtDO29CQUNsQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDO2dCQUNELElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRTtvQkFFWixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNyQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFN0QsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXhGLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7b0JBRWhELElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztvQkFDaEQsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBRXBFLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFFN0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxhQUFhLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBdUIsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDeEcsQ0FBQzthQUNKLENBQUM7WUFFRixJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7WUFDMUIsQ0FBQztpQkFBTSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7Z0JBQy9CLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztZQUN2QixDQUFDO1lBRUQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixDQUFDO0tBRUo7SUE3RkQsMEJBNkZDOzs7OztJQ2xHRCxNQUFxQixNQUFNO1FBRXZCLFlBQW9CLEdBQVEsRUFDaEIsYUFBNEI7WUFEcEIsUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNoQixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUFJLENBQUM7UUFFdEMsbUJBQW1CLENBQUMsUUFBZ0I7WUFDdkMsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRyxDQUFDO1FBRU0sY0FBYyxDQUFDLFFBQWdCO1lBQ2xDLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQ3BELENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTyxhQUFhLENBQUMsS0FBd0I7WUFDMUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsT0FBTztZQUM5QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksS0FBSztnQkFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQzNDLENBQUM7Z0JBQ0YsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFDM0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3hELENBQUM7UUFDTCxDQUFDO1FBRU8sUUFBUSxDQUFDLEtBQXdCO1lBQ3JDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUVkLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxDQUFDO1lBRXhGLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3RDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEIsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3RCLHNCQUFzQjtnQkFDdEIsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkIsQ0FBQztRQUNMLENBQUM7S0FDSjtJQXZDRCx5QkF1Q0M7Ozs7O0lDdkNELE1BQXFCLFlBQVk7UUFFN0IsWUFBb0IsUUFBa0IsRUFBVSxpQkFBb0M7WUFBaEUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUFVLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7UUFBSSxDQUFDO1FBRWxGLFVBQVU7WUFDYixJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBRU0sTUFBTSxDQUFDLFFBQWdCO1lBQzFCLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO1FBRU0sbUJBQW1CO1lBQ3RCLE1BQU0sVUFBVSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3pGLHFCQUFxQjtZQUNyQixDQUFDLENBQUMseUNBQXlDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELENBQUMsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM1RSxxQkFBcUI7WUFDckIsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQ3pDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDeEUsbUJBQW1CO1lBQ25CLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbEMsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBQ2pILElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ1AsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6QixDQUFDO3FCQUFNLENBQUM7b0JBQ0osYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN6QixDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxzQkFBc0I7WUFDdEIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDekUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTyxhQUFhLENBQUMsS0FBd0I7WUFDMUMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUV0QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsU0FBUyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6RCxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUMvRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUMzQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDM0IsQ0FBQztLQUNKO0lBaERELCtCQWdEQzs7Ozs7SUNuREQsTUFBcUIsSUFBSTtRQUVkLFlBQVksQ0FBQyxPQUFZO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQztRQUVNLFlBQVksQ0FBQyxPQUFZO1lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRyxDQUFDO1FBRU8sZUFBZSxDQUFDLE9BQVk7WUFDaEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBRU0sZUFBZSxDQUFDLFFBQWdCO1lBQ25DLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRU8sWUFBWSxDQUFDLEtBQXdCO1lBQ3pDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDcEMsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUFFLE9BQU87WUFDaEYsQ0FBQyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztpQkFDaEcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxtQkFBbUIsQ0FBQyxTQUFTO1lBQ2pDLElBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNoRCxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUVPLHFCQUFxQixDQUFDLEtBQUs7WUFDL0IsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFFTyxZQUFZLENBQUMsT0FBWTtZQUM3QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUVNLGtCQUFrQjtZQUVyQixDQUFDLENBQUMsaUVBQWlFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBRXRGLElBQUksT0FBTyxHQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFM0IsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUN2RSxPQUFPO2dCQUVYLElBQUksYUFBa0IsQ0FBQztnQkFDdkIsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDbkMsYUFBYSxHQUFHLEVBQUUsQ0FBQztvQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUU7d0JBQ3hDLElBQUksUUFBUSxHQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDakMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxtQkFBbUIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztvQkFDeEwsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUMxQyxJQUFJLENBQUMsYUFBYTt3QkFDZCxhQUFhLEdBQUcsRUFBRSxDQUFDO29CQUV2QixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTt3QkFDN0MsSUFBSSxRQUFRLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNqQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxxQkFBcUIsQ0FBQzt3QkFDbkcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDOzRCQUN0QyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUkseUJBQXlCLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQzt3QkFDdEgsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQzs0QkFDM0IsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsQ0FBQztvQkFDcEcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztxQkFDSSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ3RCLGFBQWEsR0FBRyxFQUFFLENBQUM7Z0JBQ3ZCLENBQUM7Z0JBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTtvQkFFcEQsSUFBSSxPQUFPLGFBQWEsS0FBSyxRQUFRO3dCQUNqQyxhQUFhLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzt5QkFDMUMsQ0FBQzt3QkFDRixJQUFJLGdCQUFnQixHQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDekMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsRUFBRTs0QkFDakQsSUFBSSxRQUFRLEdBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNqQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsR0FBRyxDQUFDO3dCQUN4TCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFOzRCQUN0RCxJQUFJLFFBQVEsR0FBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2pDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLHFCQUFxQixDQUFDOzRCQUNuRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUM7Z0NBQ3RDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSx5QkFBeUIsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsR0FBRyxDQUFDOzRCQUN0SCxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dDQUMzQixhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxDQUFDO3dCQUNwRyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksT0FBTyxhQUFhLEtBQUssUUFBUTtvQkFDakMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLENBQUM7cUJBQzVDLENBQUM7b0JBQ0YsSUFBSSxZQUFZLEdBQVc7Ozs7aUZBSXNDLENBQUM7b0JBRWxFLEtBQUssSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7d0JBQzVCLElBQUksVUFBVSxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBRXpELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDOzRCQUN2QyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7NEJBQ3RELFlBQVksSUFBSSxpREFBaUQsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQzt3QkFDbEgsQ0FBQzs7NEJBRUcsWUFBWSxJQUFJLGtDQUFrQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDO29CQUN2RyxDQUFDO29CQUVELFlBQVksSUFBSSxjQUFjLENBQUM7b0JBRS9CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLENBQUM7Z0JBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRS9DLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKO0lBL0hELHVCQStIQzs7Ozs7SUMvSEQsTUFBcUIsZUFBZTtRQUN6QixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZHLFlBQW9CLFNBQWlCO1lBQWpCLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBSSxDQUFDO1FBRWxDLE1BQU07WUFDViw0R0FBNEc7WUFFNUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRTFELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXRELElBQUksT0FBTyxHQUFHO2dCQUNWLE1BQU0sRUFBRSxFQUFFO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULEVBQUUsRUFBRTtvQkFDQSxTQUFTLEVBQUUsU0FBUztvQkFDcEIsNkJBQTZCLEVBQUUsSUFBSTtvQkFDbkMsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFdBQVcsRUFBRSxLQUFLO29CQUNsQixVQUFVLEVBQUUsS0FBSztvQkFDakIsU0FBUyxFQUFFO3dCQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztxQkFDM0I7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLHVEQUF1RDt3QkFDdkQseURBQXlEO3dCQUN6RCxRQUFRO3dCQUNSLDhDQUE4Qzt3QkFDOUMsbURBQW1EO3FCQUFDO2lCQUMzRDthQUNKLENBQUM7WUFFRixJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzNDLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO2dCQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoQyxDQUFDOztnQkFDSSxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUM7S0FDSjtJQXhDRCxrQ0F3Q0M7Ozs7OztJQ3JDRCxNQUFhLGlCQUFpQjtRQUMxQixZQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDaEg7SUFKRCw4Q0FJQztJQUVELE1BQXFCLFVBQVU7UUFHM0IsWUFBb0IsS0FBYSxFQUFVLFdBQXdCO1lBQS9DLFVBQUssR0FBTCxLQUFLLENBQVE7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFakUsTUFBTTtZQUNULElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTTtnQkFBRSxPQUFPO1lBRWpELGdDQUFnQztZQUNoQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDM0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQixDQUFDO1FBQ0wsQ0FBQztRQUVTLFdBQVc7WUFDakIsSUFBSSxnQkFBTSxDQUFDLGlCQUFpQixLQUFLLEdBQUc7Z0JBQUUsT0FBTyxLQUFLLENBQUM7WUFDbkQsNkRBQTZEO1lBQzdELE9BQU8sT0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssV0FBVztnQkFDOUMsT0FBTyxNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBSyxXQUFXO2dCQUNoRCxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxXQUFXO2dCQUM3QyxnQkFBTSxDQUFDLG1CQUFtQixDQUFDO1FBQ3RDLENBQUM7UUFFUyxlQUFlO1lBQ3JCLElBQUksZ0JBQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUM3Qiw0Q0FBNEM7Z0JBQzVDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3JDLENBQUM7aUJBQU0sQ0FBQztnQkFDSiwrQ0FBK0M7Z0JBQy9DLElBQUksQ0FBQyxjQUFjLENBQUMsZ0JBQU0sQ0FBQyxtQkFBbUIsR0FBRyxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQztZQUN6RyxDQUFDO1FBQ0wsQ0FBQztRQUVTLGVBQWU7WUFDckIsNEJBQTRCO1lBQzVCLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7WUFDekQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBTSxDQUFDLG1CQUFtQixHQUFHLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFUyx5QkFBeUI7WUFDL0Isc0RBQXNEO1lBQ3RELElBQUksT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssV0FBVyxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztnQkFDbEIsd0VBQXdFO2dCQUN2RSxNQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxVQUFTLGFBQWtCO29CQUNqRSxJQUFJLGFBQWEsSUFBSSxPQUFPLGFBQWEsQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7d0JBQzlELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztvQkFDNUMsQ0FBQzt5QkFBTSxJQUFJLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO3dCQUN4RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELENBQUM7eUJBQU0sQ0FBQzt3QkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLCtFQUErRSxDQUFDLENBQUM7d0JBQy9GLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDM0IsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7aUJBQU0sQ0FBQztnQkFDSixPQUFPLENBQUMsS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7Z0JBQ3RFLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQixDQUFDO1FBQ0wsQ0FBQztRQUVTLHNCQUFzQjtZQUM1QixNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRW5HLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDdkIsT0FBTztZQUNYLENBQUM7WUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUVTLG1CQUFtQixDQUFDLFdBQWdCO1lBQzFDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFFM0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDO2lCQUM5QixJQUFJLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDdkQsQ0FBQyxDQUFDO2lCQUNELEtBQUssQ0FBQyxDQUFDLEtBQVUsRUFBRSxFQUFFO2dCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUN2RCx5QkFBeUI7Z0JBQ3pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFUyxzQkFBc0I7WUFDNUIsUUFBUSxDQUFDLFFBQVEsR0FBRyxnQkFBTSxDQUFDLG1CQUFtQixDQUFDO1lBQy9DLFFBQVEsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLGdCQUFNLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDO1lBRTFFLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztZQUVwRixNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVTLG9CQUFvQixDQUFDLE1BQVc7WUFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pDLG9DQUFvQztnQkFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsb0JBQW9CO1lBQzFCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsd0JBQXdCLENBQUM7WUFFbkYsT0FBTztnQkFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztnQkFDMUMsK0NBQStDO2dCQUMvQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksdUJBQXVCO2dCQUN0RSxVQUFVLEVBQUUsS0FBSztnQkFDakIsMENBQTBDO2FBQzdDLENBQUM7UUFDTixDQUFDO1FBRVMsb0JBQW9CO1lBQzFCLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsd0JBQXdCO2dCQUMzRSxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksVUFBVSxDQUFDLGdCQUFnQjthQUM5RSxDQUFDO1FBQ04sQ0FBQztRQUVTLG1CQUFtQixDQUFDLFdBQW1CO1lBQzdDLHlEQUF5RDtZQUN6RCxNQUFNLGNBQWMsR0FBRztnQkFDbkIsU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7Z0JBQ3JDLFFBQVEsRUFBRSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztnQkFDckssU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDO2dCQUN4TSxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQzthQUMxTixDQUFDO1lBRUYsT0FBTyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFUyxjQUFjLENBQUMsR0FBVyxFQUFFLFFBQW9CO1lBQ3RELFFBQVEsR0FBRyxDQUFDLE9BQU8sUUFBUSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztZQUVuRSxJQUFJLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO2dCQUMxQyxNQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDNUMsT0FBTztZQUNYLENBQUM7WUFFRCxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUNILElBQUksRUFBRSxLQUFLO2dCQUNYLEdBQUcsRUFBRSxHQUFHO2dCQUNSLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsS0FBSyxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUM7UUFDUCxDQUFDOztJQXpKYSwyQkFBZ0IsR0FBVyw2QkFBNkIsQ0FBQztzQkFEdEQsVUFBVTs7Ozs7O0lDTC9CLE1BQWEsa0JBQWtCO1FBQzNCLFlBQW9CLFdBQXdCO1lBQXhCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQUksQ0FBQztRQUUxQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4RztJQUpELGdEQUlDO0lBQ0QsTUFBcUIsV0FBVztRQUM1QixZQUFZLFdBQWdCLEVBQVUsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDMUQsSUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBRXhCLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pHLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0csQ0FBQztZQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFekMsTUFBTSxPQUFPLEdBQUc7Z0JBQ1osTUFBTSxFQUFFLGdCQUFNLENBQUMsV0FBVztnQkFDMUIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3pGLFdBQVcsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDO2dCQUMzRSxNQUFNLEVBQUUsZ0JBQU0sQ0FBQyxXQUFXO2dCQUMxQixLQUFLLEVBQUU7b0JBQ0gsRUFBRSxFQUFFLG1CQUFtQjtvQkFDdkIsSUFBSSxFQUFFLHFCQUFxQjtpQkFDOUI7YUFDSixDQUFDO1lBRUYsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBRTdFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRyxDQUFDO0tBQ0o7SUEzQkQsOEJBMkJDOzs7Ozs7SUNoQ0QsTUFBYSxtQkFBbUI7UUFFNUIsWUFDWSxHQUFRLEVBQ1IsSUFBVSxFQUNWLGFBQTRCO1lBRjVCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQ1Ysa0JBQWEsR0FBYixhQUFhLENBQWU7UUFBSSxDQUFDO1FBRXRDLE1BQU0sQ0FBQyxRQUFnQjtZQUMxQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUN0RyxDQUFDO0tBQ0o7SUFWRCxrREFVQztJQUVELE1BQXFCLFlBQVk7UUFNdEIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUF1QztZQUM1RCxZQUFZLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQztRQUN6QyxDQUFDO1FBRUQsWUFDVyxLQUFhLEVBQ1osR0FBUSxFQUNSLElBQVUsRUFDVixhQUE0QjtZQUg3QixVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQ1osUUFBRyxHQUFILEdBQUcsQ0FBSztZQUNSLFNBQUksR0FBSixJQUFJLENBQU07WUFDVixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUFJLENBQUM7UUFFdEMsTUFBTTtZQUNULElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsK0JBQStCLENBQUMsRUFBRSxDQUFDO2dCQUNqRCxPQUFPO1lBQ1gsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELENBQUM7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBRTlGLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7b0JBQ3ZDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7NEJBQ3JELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO3dCQUN2RSxDQUFDO29CQUNMLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDWixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBRTVELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFN0UsSUFBSSxDQUFDLEtBQUs7aUJBQ0wsSUFBSSxDQUFDLDZDQUE2QyxDQUFDO2lCQUNuRCxNQUFNLENBQUMscUNBQXFDLENBQUM7aUJBQzdDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2lCQUN6QixFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztpQkFDcEMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQ2YsSUFBSSxFQUNKLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUN4QixZQUFZLENBQUMsYUFBYSxFQUMxQixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUM5QixDQUFDO1lBQ04sSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6RCxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFFM0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDakMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM1RCxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFTyxtQkFBbUI7WUFDdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkQsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyRCxPQUFPO2dCQUNILE1BQU0sRUFBRTtvQkFDSixNQUFNLEVBQUU7d0JBQ0osT0FBTyxFQUFFLFNBQVM7d0JBQ2xCLElBQUksRUFBRSxDQUFDO2dDQUNILE9BQU8sRUFBRSxFQUFFO2dDQUNYLElBQUksRUFBRSxFQUFFO2dDQUNSLEtBQUssRUFBRSxFQUFFOzZCQUNaLENBQUM7d0JBQ0YsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7NEJBQ1IsT0FBTztnQ0FDSCxJQUFJLEVBQUUsTUFBTTtnQ0FDWixHQUFHO2dDQUNILElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO2dDQUN4QixTQUFTLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFOzZCQUN2QyxDQUFDO3dCQUNOLENBQUM7cUJBQ0o7aUJBQ0o7Z0JBQ0QsUUFBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRTthQUN6QyxDQUFDO1FBQ04sQ0FBQztRQUVPLHFCQUFxQjtZQUN6QixJQUFJLFFBQVEsR0FBb0M7Z0JBQzVDLFlBQVksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM1RCxDQUFDO2dCQUNELGdCQUFnQixFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFO29CQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUM5QixNQUFNLEtBQUssR0FBSSxJQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7b0JBQ2hILElBQUksS0FBSyxJQUFJLENBQUMsRUFBRSxDQUFDO3dCQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDM0MsQ0FBQztvQkFFRCxPQUFPLElBQUksQ0FBQztnQkFDaEIsQ0FBQzthQUNKLENBQUM7WUFFRixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUNyQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7b0JBQzFCLFlBQVksRUFBRSxHQUFHLEVBQUU7d0JBQ2YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDOzRCQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDdkIsQ0FBQztvQkFDTCxDQUFDO2lCQUNKLENBQUMsQ0FBQztZQUNQLENBQUM7WUFFRCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDO1FBRVMsaUJBQWlCO1lBQ3ZCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDO1lBRWhFLE9BQU87Z0JBQ0gsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsU0FBUyxFQUFFLENBQUM7Z0JBQ1osT0FBTyxFQUFFLENBQUMsZ0JBQWdCO2dCQUMxQixhQUFhLEVBQUUsSUFBSTtnQkFDbkIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsbUJBQW1CLEVBQUUsSUFBSTtnQkFDekIsYUFBYSxFQUFFLFVBQVU7Z0JBQ3pCLGFBQWEsRUFBRSw0Q0FBNEM7YUFFOUQsQ0FBQztRQUNOLENBQUM7UUFFUyxXQUFXO1lBQ2pCLE1BQU0sUUFBUSxHQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFdkUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO1lBRWhELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUM7UUFFUyxVQUFVO1lBQ2hCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUFDLENBQUM7WUFDekQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ3hELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLENBQUM7UUFDTCxDQUFDO1FBRVMsWUFBWSxDQUFDLElBQVM7WUFFNUIsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDUCxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDbEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDN0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztvQkFBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFBQyxDQUFDO2dCQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDeEIsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBQ0QsdUZBQXVGO1lBQ3ZGLHdDQUF3QztZQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsb0RBQW9EO1FBQzFDLFFBQVEsQ0FBQyxHQUFrQztZQUNqRCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDZCxLQUFLLE1BQU0sSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNyQixFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDL0IsQ0FBQztZQUNELE9BQU8sRUFBRSxDQUFDO1FBQ2QsQ0FBQztLQUNKO0lBaExELCtCQWdMQzs7Ozs7O0lDN0xELE1BQWEsbUJBQW1CO1FBQzVCLFlBQW9CLE9BQWdCLEVBQVUsV0FBd0I7WUFBbEQsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3RFLENBQUM7UUFFTSxNQUFNLENBQUMsUUFBZ0I7WUFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQzdGLENBQUM7S0FDSjtJQVBELGtEQU9DO0lBRUQsTUFBcUIsWUFBWTtRQWNuQixVQUFVLENBQUMsR0FBVyxFQUFFLFVBQWtCO1lBQ2hELElBQUksQ0FBQyxHQUFHO2dCQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3BCLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRVMsYUFBYSxDQUFDLEdBQVcsRUFBRSxVQUFrQjtZQUNuRCxJQUFJLE1BQU0sR0FBVyxHQUFHLENBQUM7WUFDekIsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hELEtBQUssTUFBTSxLQUFLLElBQUksaUJBQWlCLEVBQUUsQ0FBQztvQkFDcEMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFRCxZQUFvQixLQUFhLEVBQVUsT0FBZ0IsRUFBRSxXQUF3QjtZQUFqRSxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQXJCbkQsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUMxQixpQkFBWSxHQUFXLElBQUksQ0FBQztZQUU1Qix3QkFBbUIsR0FBZ0IsRUFBRSxDQUFDO1lBb0IxQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUVuQyxDQUFDO1FBRU0sTUFBTTtZQUNULElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsa0NBQWtDLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxPQUFPO1lBQ1gsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pELENBQUM7WUFFRCxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNDLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUM1RCxDQUFDLENBQUMsQ0FBQTtZQUVGLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFFakUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtZQUMzRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1lBQzlELElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLDRDQUE0QyxDQUFDLENBQUE7WUFDbEUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtZQUVwRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDbkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxFQUFFO29CQUFFLE9BQU87Z0JBRTdCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUNyQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RCLE9BQU8sR0FBRyxVQUFVLENBQUMsQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO29CQUN0QixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO3dCQUNoRCxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM3QyxDQUFDO2dCQUNMLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMscUJBQXFCLENBQUMsSUFBYztZQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFNUMsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztnQkFDekMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2hCLENBQUM7WUFDRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQixDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEIsT0FBTztZQUNYLENBQUM7WUFHRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFlLEVBQUU7Z0JBQ3pDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ3BDLE9BQU87b0JBQ0gsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO29CQUMzQixJQUFJO29CQUNKLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTztpQkFDM0IsQ0FBQztZQUNOLENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxPQUFPLEdBQW1CO2dCQUM1QixRQUFRO2dCQUNSLFdBQVcsRUFBRSxDQUFDO2dCQUNkLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVztnQkFDN0IsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO2dCQUMvQixrQkFBa0IsRUFBRSxJQUFJO2dCQUN4QixZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7YUFDbEMsQ0FBQztZQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDbEIsd0NBQXdDO29CQUN4QyxvQ0FBb0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCO29CQUNsSCxRQUFRLENBQ1gsQ0FBQztnQkFDRixPQUFPO1lBQ1gsQ0FBQztZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFFaEYsS0FBSyxNQUFNLFVBQVUsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3hDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztxQkFDYixJQUFJLENBQUM7b0JBQ0YsUUFBUSxFQUFFLE1BQU07b0JBQ2hCLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRztvQkFDbkIsU0FBUyxFQUFFLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRTtvQkFDcEMsS0FBSyxFQUFFLElBQUk7b0JBQ1gsSUFBSSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUU7b0JBQ3hDLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztvQkFDaEUsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7b0JBQ3BELEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO2lCQUNwRCxDQUFDLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEQsQ0FBQztRQUNMLENBQUM7UUFFUyxTQUFTLENBQUMsTUFBbUIsRUFBRSxPQUF1QixFQUFFLE1BQXdCO1lBQ3RGLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1lBRXZCLElBQUksQ0FBQyxDQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxNQUFNLENBQUEsRUFBRSxDQUFDO2dCQUNsQixNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQ2hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsMElBQTBJLENBQUMsQ0FBQztnQkFDMUosT0FBTztZQUNYLENBQUM7WUFFRCxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFFakMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87WUFDWCxDQUFDO1lBRUcsaUdBQWlHO1lBQ2pHLElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxDQUFDLFdBQVcsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQzdELE9BQU8sQ0FBQyxDQUFDO2dCQUNiLENBQUM7Z0JBQ0QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzNDLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFFbkMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFbkMsT0FBTyxDQUFDLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQztZQUdILE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ25FLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLEtBQUssSUFBSSxJQUFJLElBQUksZUFBZSxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTTtvQkFBRSxTQUFTO2dCQUM1QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRTlFLElBQUksT0FBTyxDQUFDLGtCQUFrQixJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2xELE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7Z0JBQ3ZDLENBQUM7WUFDTCxDQUFDO1FBQ1QsQ0FBQztRQUVTLGFBQWEsQ0FBQyxJQUFvQixFQUFFLE9BQXVCO1lBQ2pFLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN0QixJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2pELEtBQUssTUFBTSxTQUFTLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQy9CLElBQUksQ0FDQSxDQUNJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSTt3QkFDekIsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTO3dCQUM5QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQy9EO3dCQUNELElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUN6RCxDQUFDO3dCQUNDLFNBQVMsR0FBRyxJQUFJLENBQUM7d0JBQ2pCLE1BQU07b0JBQ1YsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDckIsQ0FBQztZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxNQUFtQixFQUFFLE9BQXVCLEVBQUUsVUFBa0IsRUFBRSxVQUFrQixFQUFFLEtBQXVCOztZQUVySSxVQUFVLEdBQUcsVUFBVSxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsTUFBTSxJQUFHLENBQUMsSUFBSSxDQUFBLE1BQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsMENBQUUsTUFBTSxJQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7aUJBQ3ZCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO2lCQUN0QixPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztpQkFDaEIsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7aUJBQ2pCLFdBQVcsRUFBRSxDQUFDO1lBRXZCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUM7WUFDakUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUV2RSxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsMkNBQTJDLE1BQU0sWUFBWSxFQUFFLDRDQUE0QyxNQUFNLENBQUMsSUFBSSxVQUFVLFVBQVUsSUFBSSxRQUFRLHdDQUF3QyxLQUFLLENBQUMsTUFBTSxrQkFBa0IsQ0FBQyxDQUFBO1lBRW5QLDhEQUE4RDtZQUM5RCx5RkFBeUY7WUFDekYsb0NBQW9DO1lBRXBDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JDLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRTNDLE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxDQUFDO1lBRWhDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsR0FBRyxtQkFBbUIsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMvRCxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RCLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBRUQsYUFBYSxHQUFHLENBQUMsQ0FBQyx1Q0FBdUMsR0FBRyxNQUFNLEdBQUcsUUFBUSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFakgsSUFBSSxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxNQUFNLElBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDdkMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELENBQUM7WUFFRCxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3RFLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRTlFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxNQUFNLENBQUMsS0FBYTtZQUNoQixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQzlDLENBQUM7UUFFUyxVQUFVLENBQUMsSUFBb0IsRUFBRSxPQUF1QjtZQUM5RCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLEtBQUs7Z0JBQy9CLElBQUksR0FBRyxtQkFBbUIsQ0FBQztpQkFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxTQUFTO2dCQUN4QyxJQUFJLEdBQUcsbUJBQW1CLENBQUM7WUFFL0IsT0FBTyxDQUFDLENBQ0osZUFBZSxJQUFJLENBQUMsZUFBZSxJQUFJO2dCQUN2QywyQkFBMkI7Z0JBQzNCLG9CQUFvQjtnQkFDcEIsK0NBQStDLElBQUksQ0FBQyxHQUFHLElBQUk7Z0JBQzNELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEUsTUFBTTtnQkFDTixRQUFRO2dCQUNSLG1DQUFtQztnQkFDbkMsOEJBQThCLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsWUFBWSxDQUFDLFlBQVk7Z0JBQ3hILCtCQUErQixJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxZQUFZO2dCQUNwSCw4QkFBOEIsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBWTtnQkFDekgsUUFBUTtnQkFDUixRQUFRO2dCQUNSLFFBQVEsQ0FBQyxDQUFDO1FBRWxCLENBQUM7UUFFUyxVQUFVLENBQUMsT0FBdUIsRUFBRSxLQUFnQjtZQUMxRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDN0QsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDN0QsSUFBSSxPQUFPLENBQUMsV0FBVyxLQUFLLENBQUMsRUFBRSxDQUFDO29CQUM1QixPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FDckIsd0NBQXdDO3dCQUN4QyxvQ0FBb0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCO3dCQUNsSCxRQUFRLENBQ1gsQ0FBQztnQkFDTixDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFUyxPQUFPLENBQUMsTUFBbUIsRUFBRSxLQUFnQjtZQUNuRCxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDaEMsNEZBQTRGO1lBQzVGLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQztRQUVTLFFBQVEsQ0FBQyxJQUFTO1lBQ3hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xDLE9BQU8sMERBQTBELElBQUksQ0FBQyxNQUFNLGtCQUFrQixJQUFJLENBQUMsT0FBTyxrQkFBa0IsQ0FBQztZQUNqSSxDQUFDO2lCQUNJLENBQUM7Z0JBQ0YsT0FBTyxhQUFhLElBQUksQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUMzQyxDQUFDO1FBQ0wsQ0FBQztRQUVTLE9BQU8sQ0FBQyxLQUF1QixFQUFFLEdBQVc7WUFDbEQsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMxQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNYLENBQUM7S0FDSjtJQWpURCwrQkFpVEM7SUFFRCxJQUFZLFNBSVg7SUFKRCxXQUFZLFNBQVM7UUFDakIsK0NBQU8sQ0FBQTtRQUNQLCtDQUFPLENBQUE7UUFDUCw2Q0FBTSxDQUFBO0lBQ1YsQ0FBQyxFQUpXLFNBQVMseUJBQVQsU0FBUyxRQUlwQjtJQWtDRCxJQUFZLFVBSVg7SUFKRCxXQUFZLFVBQVU7UUFDbEIsbURBQVEsQ0FBQTtRQUNSLDZDQUFLLENBQUE7UUFDTCxxREFBUyxDQUFBO0lBQ2IsQ0FBQyxFQUpXLFVBQVUsMEJBQVYsVUFBVSxRQUlyQjs7Ozs7O0lDdFdELE1BQWEsYUFBYTtRQUN0QixZQUFvQixJQUFVO1lBQVYsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUFJLENBQUM7UUFFNUIsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckc7SUFKRCxzQ0FJQztJQUVELE1BQXFCLE1BQU07UUFJdkIsWUFBWSxXQUFtQixFQUFVLElBQVU7WUFBVixTQUFJLEdBQUosSUFBSSxDQUFNO1lBQy9DLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLEVBQUUsQ0FBQztRQUMxSSxDQUFDO1FBRU0sTUFBTTtZQUVULElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdILElBQUksWUFBWTtnQkFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRTdELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLGNBQWMsQ0FBQztZQUN2RSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLElBQUksS0FBSztvQkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEQsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO29CQUFFLE9BQU87Z0JBQ2xELElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztnQkFDckcsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQ3BCLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2dCQUU5RixJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQztvQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFaEgsOENBQThDO2dCQUM5QyxvSEFBb0g7Z0JBQ3BILElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3hELElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDO29CQUFFLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzRCxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2pELElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM3SCxXQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUcseUJBQXlCO1lBQzFLLENBQUM7aUJBQ0ksQ0FBQztnQkFDRixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLENBQUMsS0FBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLHlCQUF5QjtZQUNqSSxDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBeENELHlCQXdDQzs7Ozs7SUM5Q0QsTUFBOEIsa0JBQWtCO1FBTTVDLFlBQXNCLEtBQWEsRUFBVSxXQUF3QjtZQUEvQyxVQUFLLEdBQUwsS0FBSyxDQUFRO1lBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBSW5FLElBQUk7WUFFUCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEgsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNoRSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxNQUFNLENBQUM7WUFDeEQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksTUFBTSxDQUFDO1lBRXhELElBQUksV0FBVyxJQUFJLFNBQVMsSUFBSSxXQUFXLElBQUksSUFBSSxJQUFJLFdBQVcsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDM0UsV0FBVyxHQUFHLFlBQVksQ0FBQTtZQUM5QixDQUFDO1lBRUQsSUFBSSxXQUFXLElBQUksU0FBUyxJQUFJLFdBQVcsSUFBSSxJQUFJLElBQUksV0FBVyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUMzRSxXQUFXLEdBQUcsWUFBWSxDQUFBO1lBQzlCLENBQUM7WUFFRCxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sT0FBTyxHQUFHO29CQUNaLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtvQkFDbkIsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGVBQWUsRUFBRSxJQUFJO29CQUNyQixLQUFLLEVBQUU7d0JBQ0gsS0FBSyxFQUFFLHVCQUF1Qjt3QkFDOUIsS0FBSyxFQUFFLGVBQWU7d0JBQ3RCLElBQUksRUFBRSxjQUFjO3dCQUNwQixJQUFJLEVBQUUscUJBQXFCO3dCQUMzQixFQUFFLEVBQUUsbUJBQW1CO3dCQUN2QixJQUFJLEVBQUUscUJBQXFCO3dCQUMzQixJQUFJLEVBQUUsc0JBQXNCO3dCQUM1QixRQUFRLEVBQUUscUJBQXFCO3FCQUNsQztvQkFDRCxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsTUFBTSxJQUFJLENBQUM7b0JBQ2hGLE1BQU0sRUFBRSxnQkFBTSxDQUFDLFdBQVc7b0JBQzFCLFFBQVEsRUFBRSxRQUFRO29CQUNsQixPQUFPLEVBQUUsV0FBVztvQkFDcEIsT0FBTyxFQUFFLFdBQVc7aUJBRXZCLENBQUM7Z0JBRUYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRW5DLHdEQUF3RDtnQkFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFHaEgsQ0FBQzs7Z0JBQ0ksS0FBSyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLENBQUM7S0FDSjtJQWpFRCxxQ0FpRUM7Ozs7OztJQ2hFRCxNQUFhLGlCQUFpQjtRQUMxQixZQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUc7SUFKRCw4Q0FJQztJQUVELE1BQXFCLFVBQVcsU0FBUSw0QkFBa0I7UUFJdEQsWUFBWSxXQUFtQixFQUFFLFdBQXdCO1lBQ3JELEtBQUssQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFKMUIsZ0JBQVcsR0FBRyxhQUFhLENBQUM7WUFDNUIsV0FBTSxHQUFHLGdCQUFNLENBQUMsV0FBVyxDQUFDO1FBSXRDLENBQUM7UUFFUyxhQUFhLENBQUMsT0FBWTtZQUNoQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxNQUFNO2FBQ3hELENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSjtJQWJELDZCQWFDOzs7Ozs7SUNuQkQsTUFBYSxxQkFBcUI7UUFDOUIsWUFBb0IsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUFBSSxDQUFDO1FBRTFDLE1BQU0sQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xIO0lBSkQsc0RBSUM7SUFFRCxNQUFxQixjQUFlLFNBQVEsNEJBQWtCO1FBSTFELFlBQVksV0FBbUIsRUFBRSxXQUF3QjtZQUNyRCxLQUFLLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBSjFCLGdCQUFXLEdBQUcseUJBQXlCLENBQUM7WUFDeEMsV0FBTSxHQUFHLGdCQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFJM0MsQ0FBQztRQUVTLGFBQWEsQ0FBQyxPQUFZO1lBQ2hDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNkLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsSUFBSTthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0o7SUFkRCxpQ0FjQzs7Ozs7SUN2QkQsTUFBcUIsY0FBYztRQUN4QixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBRXJHLFlBQW9CLEtBQWE7WUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQUksQ0FBQztRQUU5QixNQUFNO1lBQ1YsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNoRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBRWhELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO2dCQUNoQixPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQztnQkFDeEIsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUM7Z0JBQ3hCLElBQUksRUFBRSxDQUFDO2FBQ1YsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztLQUNKO0lBZkQsaUNBZUM7Ozs7OztJQ1ZELHlCQUF5QjtJQUN6QixvREFBb0Q7SUFDcEQsZ0RBQWdEO0lBRWhELE1BQWEsaUJBQWlCO1FBRTFCLFlBQ2MsR0FBUSxFQUNSLGFBQTRCO1lBRDVCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUN0QyxDQUFDO1FBRUUsTUFBTSxDQUFDLFFBQWdCO1lBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25CLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFFbkMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNULElBQUksVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDakUsQ0FBQztxQkFBTSxDQUFDO29CQUNKLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzFFLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSjtJQW5CRCw4Q0FtQkM7SUFFRCxNQUFxQixVQUFVO1FBWTNCLFlBQXNCLEtBQWEsRUFBWSxHQUFRLEVBQVksYUFBNEI7WUFBekUsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUFZLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFBWSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtZQStIdkYsa0JBQWEsR0FBRyxDQUFDLEtBQWdCLEVBQUUsTUFBYyxFQUFFLEtBQWEsRUFBRSxFQUFFO2dCQUN4RSxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQTtZQWpJRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUVqQyw0QkFBNEI7WUFDNUIsbURBQW1EO1lBRW5ELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEQsdURBQXVEO1lBQ3ZELHNEQUFzRDtZQUV0RCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTFELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBRU0sTUFBTTtZQUNULElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztZQUNqRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssU0FBUyxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDaEUsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLCtDQUErQyxDQUFDLENBQUM7WUFDdEcsQ0FBQztZQUVELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUIsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVTLG1CQUFtQjtZQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBRVMsbUJBQW1CO1lBQ3pCLE9BQU87Z0JBQ0gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU87Z0JBQ2hELFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7Z0JBQ3RDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJO2dCQUMzRCxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssTUFBTTtnQkFDckQsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDbEMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztnQkFDbEMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztnQkFDMUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLE1BQU07Z0JBQy9DLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxPQUFPO2dCQUN0RCxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7Z0JBQzVDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQzthQUNuRCxDQUFDO1FBQ04sQ0FBQztRQUVTLG9CQUFvQjtZQUMxQixPQUFPO2dCQUNILFFBQVEsRUFBRSxNQUFNO2dCQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNsQyxnQkFBZ0IsRUFBRSxLQUFLO2dCQUN2QixJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNuQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNoQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWE7Z0JBQ3pCLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLFNBQVMsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUU7Z0JBQ3BDLFFBQVEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUM5QyxDQUFDO1FBQ04sQ0FBQztRQUVPLHlCQUF5QjtZQUM3QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztRQUVPLGVBQWU7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFBQyxPQUFPLEtBQUssQ0FBQztZQUFDLENBQUM7WUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQUMsT0FBTyxLQUFLLENBQUM7WUFBQyxDQUFDO1lBQzVCLElBQUksSUFBSSxLQUFLLGFBQWEsRUFBRSxDQUFDO2dCQUFDLE9BQU8sS0FBSyxDQUFDO1lBQUMsQ0FBQztZQUM3QyxJQUFJLElBQUksS0FBSyxjQUFjLEVBQUUsQ0FBQztnQkFBQyxPQUFPLEtBQUssQ0FBQztZQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUVPLGdCQUFnQjtZQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRS9CLElBQUksQ0FBQyxxQkFBcUI7aUJBQ3JCLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNoQyxVQUFVLENBQUMsVUFBVSxDQUFDO2lCQUN0QixRQUFRLENBQUMsYUFBYSxDQUFDO2lCQUN2QixJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztpQkFDNUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFFeEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFTyxrQkFBa0I7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2dCQUFDLE9BQU87WUFBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6RixDQUFDO1FBRU8scUJBQXFCO1lBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7UUFFTyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUk7WUFDekIsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pELElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMxRCxDQUFDO1FBQ0wsQ0FBQztRQUVTLGFBQWEsQ0FBQyxDQUFDLEVBQUUsSUFBUztZQUNoQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFPTyxlQUFlLENBQUMsUUFBUTtZQUM1QixJQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsS0FBSyxFQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0IsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDaEYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkYsQ0FBQztxQkFBTSxDQUFDO29CQUNKLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzdDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLENBQUM7UUFDTCxDQUFDO1FBRVMsaUJBQWlCLENBQUMsUUFBUTtZQUNoQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDM0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBRW5ELElBQUksQ0FBQyxlQUFlLENBQUM7Z0JBQ2pCLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQztnQkFDekQsRUFBRTtnQkFDRixRQUFRO2FBQ1gsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVTLGVBQWUsQ0FBQyxJQUE0QjtZQUNsRCwwQkFBZ0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRU8sUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJO1lBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzlCLENBQUM7UUFFUyxrQkFBa0IsQ0FBQyxLQUFhO1lBQ3RDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDeEUsQ0FBQztLQUNKO0lBekxELDZCQXlMQztJQUVELE1BQWEsWUFBYSxTQUFRLFVBQVU7UUFDeEMsWUFDSSxLQUFhLEVBQ2IsR0FBUSxFQUNSLGFBQTRCLEVBQ2xCLFNBQWlCO1lBRTNCLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRnZCLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFpQnZCLFFBQUcsR0FBRyxDQUFDLENBQW9CLEVBQUMsUUFBWSxFQUFFLEVBQUU7Z0JBQ2hELE1BQU0sSUFBSSxHQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSwyQ0FBMkM7Z0JBQ3pFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDekIsTUFBTSxHQUFHLEdBQUcsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUVqQyxNQUFNLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO2dCQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBRXJDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTO29CQUNuQixJQUFJLEVBQUUsTUFBTTtvQkFDWixXQUFXLEVBQUUsS0FBSztvQkFDbEIsV0FBVyxFQUFFLEtBQUs7b0JBQ2xCLElBQUk7b0JBQ0osT0FBTyxFQUFFLEdBQUcsRUFBRTt3QkFDVixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7NEJBQzlCLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDOzRCQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3hFLENBQUM7NkJBQU0sQ0FBQzs0QkFDSixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQzs0QkFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0QyxDQUFDO3dCQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQzs0QkFDbkIsRUFBRTs0QkFDRixRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUk7eUJBQ3RCLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN6QixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3JDLENBQUM7b0JBQ0QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRTt3QkFDekIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFDRCxHQUFHLEVBQUUsR0FBRyxFQUFFO3dCQUNOLE1BQU0sR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUN4QyxHQUFHLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFOzRCQUM1QyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dDQUN2QixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDdkMsQ0FBQzt3QkFDTCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBRVYsT0FBTyxHQUFHLENBQUM7b0JBQ2YsQ0FBQztpQkFDSixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUE7WUFRTyxXQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUNsQixPQUFPLHNDQUFzQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtvQkFDakUsdUNBQXVDO29CQUN2QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMsdUNBQXVDO29CQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDMUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQTtRQTdFRCxDQUFDO1FBRVMsbUJBQW1CO1lBQ3pCLE9BQU8sU0FBUyxDQUFDO1FBQ3JCLENBQUM7UUFFUyxvQkFBb0I7WUFDMUIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUNYO2dCQUNJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRzthQUNoQixFQUNELEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQW1EUyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUU7WUFDeEMsTUFBTSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUVqRCxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELENBQUM7S0FXSjtJQXRGRCxvQ0FzRkM7Ozs7OztJQ2hURCxNQUFxQixpQkFBaUI7UUFDM0IsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlGO0lBRkQsb0NBRUM7SUFFRCxNQUFhLFVBQVU7UUFDbkIsWUFBc0IsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBSSxDQUFDO1FBRWxDLE1BQU07WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDOUUsQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBRTdCLElBQUksQ0FBQyxlQUFlLENBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksSUFBSSxFQUMzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLFFBQVEsQ0FDdEQsQ0FBQztnQkFFRixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsR0FBRyxFQUFFO29CQUM3RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO29CQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxlQUFlLENBQUMsRUFBVSxFQUFFLE1BQWM7WUFDN0MsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQztRQUVNLFdBQVcsQ0FBQyxJQUFZLEVBQUUsV0FBdUI7WUFDcEQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDaEQsSUFBSSxDQUFDO29CQUFFLFdBQVcsRUFBRSxDQUFDOztvQkFDaEIsT0FBTyxLQUFLLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0o7SUFoQ0QsZ0NBZ0NDOzs7OztJQ25DRCxNQUFxQixPQUFPO1FBSWpCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFL0UsTUFBTSxDQUFDLGVBQWUsQ0FBQyxRQUFnQjtZQUMxQyxRQUFRLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDakQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzlHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELFlBQVksV0FBZ0I7WUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxXQUFXLENBQUM7WUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLFdBQVcsRUFBRSxDQUFDLEVBQUUsV0FBVyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3pELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO2dCQUFFLE9BQU8sQ0FBQyxrQkFBa0I7WUFDdEUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFekIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFFdEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNyRCxJQUFJLE9BQU87Z0JBQUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM5QyxDQUFDO0tBQ0o7SUF6QkQsMEJBeUJDOzs7OztJQ3pCRCxNQUFxQixhQUFhO1FBQ3ZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckcsWUFBb0IsS0FBYTtZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBSSxDQUFDO1FBRTlCLE1BQU07WUFDVixnREFBZ0Q7WUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRXRGLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLEVBQUU7b0JBQUUsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLFNBQVMsQ0FBQyxLQUFVO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ2xELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO1lBRXRHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ25CLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3ZDLElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNsRixJQUFJLGNBQWM7b0JBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDOztvQkFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0o7SUExQkQsZ0NBMEJDOzs7OztJQzNCRCxNQUFxQixZQUFZO1FBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEcsWUFBb0IsS0FBYTtZQUFiLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBSSxDQUFDO1FBRTlCLE1BQU07WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFFBQVEsRUFBRSxpQkFBaUI7Z0JBQzNCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxTQUFTLEVBQUUsSUFBSTtnQkFDZixTQUFTLEVBQUUsTUFBTTthQUNwQixDQUFDLENBQUM7UUFDUCxDQUFDO0tBQ0o7SUFmRCwrQkFlQzs7Ozs7SUNmRCxNQUFxQixRQUFRO1FBQ2xCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0IsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkYsWUFBWSxPQUFlO1lBQ3ZCLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDdkUsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN4RCxJQUFJLFlBQVksSUFBSSxTQUFTLElBQUksWUFBWSxJQUFJLElBQUksSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQzVFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLENBQUM7S0FDSjtJQVhELDJCQVdDOzs7Ozs7SUNQRCxNQUFhLGtCQUFrQjtRQUMzQixZQUFvQixXQUF3QjtZQUF4QixnQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUFJLENBQUM7UUFFMUMsTUFBTSxDQUFDLFFBQWdCLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0c7SUFKRCxnREFJQztJQUVELE1BQXFCLFdBQVc7UUFDNUIsMERBQTBEO1FBRzFELFlBQXNCLGFBQXFCLEVBQVUsV0FBd0I7WUFBdkQsa0JBQWEsR0FBYixhQUFhLENBQVE7WUFBVSxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUN6RSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWTtnQkFDakIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLGdCQUFnQixHQUFHLEdBQUcsQ0FBQztRQUM3RCxDQUFDO1FBRU0sSUFBSTtZQUVQLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUNoRSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkQsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUM3RCxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLENBQUM7WUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxLQUFLLENBQUM7WUFDOUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxjQUFjLENBQUM7WUFDbkYsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUNoRixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDbkQsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUM3RCxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLENBQUM7WUFDRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLENBQUM7WUFDeEQsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxDQUFDO1lBRXBFLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuRCxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzdELFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsQ0FBQztZQUNELElBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxLQUFLLENBQUM7WUFDbEYsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNyRixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLFVBQVUsQ0FBQztZQUMvRSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLDBCQUEwQixDQUFDO1lBQzdGLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUN4RCxJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksSUFBSSxDQUFDO1lBQzdFLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxrQkFBa0IsQ0FBQztZQUN6RixJQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLG9CQUFvQixDQUFDO1lBQ3pGLElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLFlBQVksQ0FBQztZQUU3RSxJQUFJLGtCQUFrQixHQUFHLFdBQVcsQ0FBQztZQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzNELElBQUksTUFBTSxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3hDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQztZQUNoQyxDQUFDO1lBRUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ2xFLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwRCxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzdELFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDeEIsQ0FBQztZQUNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqRCxJQUFJLE1BQU0sSUFBSSxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQzdELFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDckIsQ0FBQztZQUNELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQztZQUNsRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUM7WUFDckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQzlELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNyRCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxLQUFLLENBQUM7WUFDdEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxDQUFDO1lBQ3RELElBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDakQsSUFBSSxNQUFNLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUM3RCxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRztnQkFDWixVQUFVLEVBQUUsVUFBVTtnQkFDdEIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLFNBQVMsRUFBRSxTQUFTO2dCQUNwQixlQUFlLEVBQUUsZUFBZTtnQkFDaEMsa0JBQWtCLEVBQUUsa0JBQWtCO2dCQUN0QyxVQUFVLEVBQUUsVUFBVTtnQkFDdEIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsWUFBWSxFQUFFLFlBQVk7Z0JBQzFCLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixtQkFBbUIsRUFBRSxtQkFBbUI7Z0JBQ3hDLHFCQUFxQixFQUFFLHFCQUFxQjtnQkFDNUMsZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLGNBQWMsRUFBRSxjQUFjO2dCQUM5QixNQUFNLEVBQUUsTUFBTTtnQkFDZCxpQkFBaUIsRUFBRSxpQkFBaUI7Z0JBQ3BDLGdCQUFnQixFQUFFLGdCQUFnQjtnQkFDbEMsZUFBZSxFQUFFLGVBQWU7Z0JBQ2hDLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixrQkFBa0IsRUFBRSxrQkFBa0I7Z0JBQ3RDLFdBQVcsRUFBRSxXQUFXO2dCQUN4QixXQUFXLEVBQUUsV0FBVztnQkFDeEIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFdBQVcsRUFBRSxXQUFXO2dCQUN4QixJQUFJLEVBQUUsSUFBSTtnQkFDVixTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osYUFBYSxFQUFFLGFBQWE7Z0JBQzVCLEtBQUssRUFBRSxLQUFLO2dCQUNaLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixRQUFRLEVBQUUsUUFBUTthQUNyQixDQUFDO1lBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0IsQ0FBQztRQUVPLGlCQUFpQjtZQUNyQiwwQ0FBMEM7WUFDMUMsMERBQTBEO1lBQzFELDBEQUEwRDtRQUM5RCxDQUFDO0tBR0o7SUFySEQsOEJBcUhDOzs7OztJQy9IRCxNQUFxQixjQUFjO1FBR3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBZ0I7WUFDakMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO29CQUNyQyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFRCxZQUFvQixLQUFhO1lBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUFJLENBQUM7UUFFOUIsTUFBTTtZQUNWLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1lBRW5ELElBQUksTUFBTSxHQUFHLEdBQUcsRUFBRTtnQkFDZCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFBRSxPQUFPO2dCQUV4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUM7WUFFRixRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN6RCxDQUFDOztJQXhCYywrQkFBZ0IsR0FBRyxTQUFTLENBQUM7c0JBRDNCLGNBQWM7Ozs7O0lDQW5DLE1BQXFCLFdBQVc7UUFHckIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFnQjtZQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNuQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3JDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVELFlBQW9CLEtBQWE7WUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQUksQ0FBQztRQUU5QixNQUFNO1lBQ1YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUM7WUFFN0MsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUFFO2dCQUNiLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO29CQUFFLE9BQU87Z0JBRXhDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFBO1lBRUQsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEQsQ0FBQzs7SUF4QmMsNEJBQWdCLEdBQUcsU0FBUyxDQUFDO3NCQUQzQixXQUFXOzs7Ozs7SUNFaEMsTUFBYSwwQkFBMEI7UUFFbkMsWUFBb0IsR0FBUTtZQUFSLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBSSxDQUFDO1FBRTFCLE1BQU0sQ0FBQyxRQUFnQixJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakg7SUFMRCxnRUFLQztJQUVELE1BQXFCLG1CQUFtQjtRQUNwQyxZQUFvQixJQUFZLEVBQVUsR0FBUTtZQUE5QixTQUFJLEdBQUosSUFBSSxDQUFRO1lBQVUsUUFBRyxHQUFILEdBQUcsQ0FBSztRQUFJLENBQUM7UUFFaEQsTUFBTTtZQUNULElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBRVMsbUJBQW1CLENBQUMsR0FBVztZQUNyQyxnQ0FBZ0M7WUFDaEMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUM7aUJBQU0sQ0FBQztnQkFDSixJQUFJLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsQ0FBQztRQUNMLENBQUM7UUFFUyxXQUFXO1lBQ2pCLHlDQUF5QztZQUN6QyxPQUFPLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FDcEIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFdBQVc7Z0JBQ3JELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLFdBQVc7Z0JBQ3ZELE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxXQUFXO2dCQUNwRCxxQ0FBcUM7Z0JBQ3BDLE1BQU0sQ0FBQyxNQUFjLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FDakQsQ0FBQztRQUNOLENBQUM7UUFFUyw0QkFBNEIsQ0FBQyxHQUFXO1lBQzlDLHFDQUFxQztZQUNyQyxJQUFJLENBQUM7Z0JBQ0QsdUNBQXVDO2dCQUN2QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUssTUFBTSxDQUFDLE1BQWMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDcEQsc0NBQXNDO29CQUN0QyxNQUFNLFNBQVMsR0FBSSxNQUFNLENBQUMsTUFBYyxDQUFDLFNBQVMsQ0FBQztvQkFDbkQsSUFBSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsQ0FBQzt3QkFDbEMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUN6QyxDQUFDO3lCQUFNLENBQUM7d0JBQ0oseUNBQXlDO3dCQUN6QyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQzs0QkFDdEIsSUFBSSxFQUFFLHlCQUF5Qjs0QkFDL0IsR0FBRyxFQUFFLEdBQUc7eUJBQ1gsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDWixDQUFDO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixnQ0FBZ0M7b0JBQ2hDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDM0MsQ0FBQztZQUNMLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ2xFLGdDQUFnQztnQkFDaEMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNDLENBQUM7WUFFRCxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUVTLDRCQUE0QixDQUFDLEdBQVc7WUFDOUMsNENBQTRDO1lBQzVDLElBQUksQ0FBQztnQkFDRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO29CQUM3QyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDNUYsQ0FBQztxQkFBTSxDQUFDO29CQUNKLE9BQU8sQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQztZQUNMLENBQUM7WUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO2dCQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsMkNBQTJDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEUsQ0FBQztZQUVELE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNuQixDQUFDO0tBQ0o7SUF6RUQsc0NBeUVDOzs7Ozs7SUM5RUQsTUFBYSxlQUFlO1FBQ3hCLFlBQ1ksR0FBUSxFQUNSLFlBQTBCO1lBRDFCLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUNsQyxDQUFDO1FBRUUsTUFBTSxDQUFDLFFBQWdCLElBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztLQUMzSDtJQVBELDBDQU9DO0lBRUQsTUFBcUIsUUFBUTtRQUN6QixZQUFvQixRQUFnQixFQUN4QixHQUFRLEVBQ1IsWUFBMEI7WUFGbEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUN4QixRQUFHLEdBQUgsR0FBRyxDQUFLO1lBQ1IsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDbEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM1SCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7S0FDSjtJQVJELDJCQVFDOzs7Ozs7SUNuQkQsTUFBYSxrQkFBa0I7UUFLM0IsWUFBbUIsR0FBVyxFQUFVLFNBQWtCLEVBQVUsU0FBMkI7WUFBNUUsUUFBRyxHQUFILEdBQUcsQ0FBUTtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQVM7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFrQjtZQUp2RixZQUFPLEdBQXNDLEdBQUcsRUFBRSxHQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxDQUFDO1lBQzFILGlCQUFZLEdBQUcsSUFBSSxLQUFLLEVBQVUsQ0FBQztZQVdwQyxrQkFBYSxHQUFHLENBQUMsR0FBVyxFQUFzQixFQUFFO2dCQUN2RCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFFNUIsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQyxDQUFBO1lBRU0sb0JBQWUsR0FBRyxDQUFDLEdBQUcsSUFBYyxFQUFzQixFQUFFO2dCQUMvRCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVCLENBQUMsQ0FBQyxDQUFDO2dCQUVILE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUMsQ0FBQTtZQVlNLGdCQUFXLEdBQUcsR0FBYSxFQUFFO2dCQUNoQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztvQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7b0JBQzFDLENBQUM7b0JBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN6QixDQUFDO3FCQUNJLENBQUM7b0JBQ0YsT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBQ2hDLENBQUM7WUFDTCxDQUFDLENBQUE7WUFFTyxtQkFBYyxHQUFHLEdBQWEsRUFBRTtnQkFDcEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBTSxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUE7UUFoREQsQ0FBQztRQUVNLFVBQVUsQ0FBQyxPQUEwQztZQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBZ0JNLGdCQUFnQixDQUFDLEdBQUcsSUFBYztZQUNyQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7WUFFeEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDZixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztLQW9CSjtJQXZERCxnREF1REM7Ozs7OztJQ3ZERCxNQUFhLGdCQUFnQjtRQUE3QjtZQUNZLGFBQVEsR0FBOEIsSUFBSSxLQUFLLEVBQXNCLENBQUM7UUErQ2xGLENBQUM7UUE3Q1UsZUFBZSxDQUFDLEdBQVcsRUFBRSxPQUEwQyxFQUFFLFVBQXlDO1lBQ3JILE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQztRQUVNLGVBQWUsQ0FBQyxHQUFXLEVBQUUsT0FBMEMsRUFBRSxVQUF5QztZQUNySCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFTSxZQUFZLENBQUMsR0FBVyxFQUFFLE9BQTBDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQSxDQUFDO1FBRUssWUFBWSxDQUFDLEdBQVcsRUFBRSxPQUEwQztZQUN2RSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU0sVUFBVSxDQUFxQixHQUFXO1lBQzdDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUU1RCxJQUFJLENBQUMsQ0FBQyxPQUFPO2dCQUNULE9BQVUsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDOztnQkFFaEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxVQUF5QyxFQUFFLE1BQWdDO1lBQ2hHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvRCxPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBRUQsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQztZQUM1QixPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO1FBRU8sR0FBRyxDQUFDLEdBQVcsRUFBRSxTQUFrQixFQUFFLE9BQTBDO1lBQ25GLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQztnQkFDdEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDO1lBRTdFLElBQUksTUFBTSxHQUFHLElBQUksdUNBQWtCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxRCxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNCLE9BQU8sTUFBTSxDQUFDO1FBQ2xCLENBQUM7S0FDSjtJQWhERCw0Q0FnREM7Ozs7O0lDbERELE1BQXFCLGFBQWE7UUFFdkIsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXhHLGNBQWMsQ0FBQyxPQUEwQjtZQUM3QyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBWSxFQUFFLE1BQWUsRUFBRSxRQUFpQixFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztLQUNKO0lBUkQsZ0NBUUM7Ozs7O0lDSkQsTUFBcUIsY0FBYztRQUcvQixZQUNZLFlBQTBCLEVBQzFCLFdBQXdCLEVBQ3hCLGFBQTRCO1lBRjVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBTGhDLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFNckIsQ0FBQztRQUVFLGlCQUFpQjtZQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7UUFDL0MsQ0FBQztRQUVNLGNBQWM7O1lBQ2pCLE9BQU8sQ0FBQyxDQUFDLENBQUEsTUFBQSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksMENBQUUsU0FBUyxDQUFBLENBQUM7UUFDdEQsQ0FBQztRQUVNLGNBQWM7WUFDakIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztRQUMzQyxDQUFDO1FBRU0sc0JBQXNCO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQztRQUNyRCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBRU0saUJBQWlCO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7S0FDSjtJQWhDRCxpQ0FnQ0M7Ozs7O0lDYUQsTUFBcUIsU0FBUztRQU8xQjtZQXFQVSxzQkFBaUIsR0FBRyxFQUFFLENBQUM7WUFHdkIseUJBQW9CLEdBQUcsRUFBRSxDQUFDO1lBdlBoQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksbUNBQWdCLEVBQUUsQ0FBQztZQUV2QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXRDLDBCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBYyxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBVSxrQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0Isa0JBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0RSxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQWlCLGtCQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7WUFFakYsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFMUIsd0RBQXdEO1lBQ3hELENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ1IsT0FBTyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUU7YUFDcEQsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDLEdBQUcsRUFBRTtnQkFDSCw4RUFBOEU7Z0JBQzlFLG1EQUFtRDtnQkFDbkQsMEVBQTBFO2dCQUMxRSxJQUFJLENBQUMsVUFBVSxDQUFRLGtCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxVQUFVLENBQVcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztZQUVILDRCQUE0QjtZQUM1QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBb0Isa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQztpQkFDekQsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDeEYsMEJBQWdCLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVTLGtCQUFrQjtZQUN4QixJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLFVBQVUsQ0FBaUIsa0JBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0RSxJQUFJLENBQUMsVUFBVSxDQUFXLGtCQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBZSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RFLENBQUM7UUFFUyxpQkFBaUIsQ0FBQyxRQUEwQjtZQUNsRCxNQUFNLEdBQUcsR0FBa0MsRUFBRSxDQUFDO1lBRTlDLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRW5FLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLG9CQUFpQixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFekYsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGVBQUssRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRWpFLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxhQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUU3RCxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksY0FBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFJL0QsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLGdCQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVuRSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSwyQkFBaUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXpGLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSx1QkFBYSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFakYsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGlCQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDbEYsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxtQkFBbUIsRUFDckQsQ0FBQyxPQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLGtDQUFtQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFjLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNuSCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakQsQ0FBQztZQUNELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLDBCQUEwQixFQUM1RCxDQUFDLEdBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxnREFBMEIsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxRCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sRUFDekMsQ0FBQyxHQUFRLEVBQUUsYUFBNEIsRUFBRSxFQUFFLENBQUMsSUFBSSxpQkFBTyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNwRixHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLE1BQU0sRUFDeEMsQ0FBQyxHQUFRLEVBQUUsYUFBNEIsRUFBRSxFQUFFLENBQUMsSUFBSSxnQkFBTSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNuRixHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGlCQUFpQixFQUNuRCxDQUFDLEdBQVEsRUFBRSxhQUE0QixFQUFFLEVBQUUsQ0FBQyxJQUFJLDhCQUFpQixDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM5RixHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDckUsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGVBQWUsRUFDakQsQ0FBQyxHQUFRLEVBQUUsWUFBMEIsRUFBRSxFQUFFLENBQUMsSUFBSSwwQkFBZSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUN6RixHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDcEUsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLFdBQVcsRUFDN0MsQ0FBQyxHQUFRLEVBQUUsWUFBMEIsRUFBRSxpQkFBb0MsRUFBRSxFQUFFLENBQzNFLElBQUksbUJBQVcsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQ2pFLENBQUM7Z0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBUSxDQUFDLFlBQVksRUFBRSxrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEcsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGFBQWEsRUFDL0MsQ0FBQyxHQUFRLEVBQUUsWUFBMEIsRUFBRSxpQkFBb0MsRUFBRSxFQUFFLENBQzNFLElBQUksdUJBQWEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQ25FLENBQUM7Z0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBUSxDQUFDLFlBQVksRUFBRSxrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEcsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLFFBQVEsRUFDMUMsQ0FBQyxXQUF3QixFQUFFLGFBQTRCLEVBQUUsWUFBMEIsRUFBRSxFQUFFLENBQ25GLElBQUksa0JBQVEsQ0FBQyxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUNsRSxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsa0JBQVEsQ0FBQyxhQUFhLEVBQUUsa0JBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNwRyxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsbUJBQW1CLEVBQ3JELENBQUMsR0FBUSxFQUFFLElBQVUsRUFBRSxhQUE0QixFQUFFLEVBQUUsQ0FDbkQsSUFBSSxrQ0FBbUIsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUM3RCxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQVEsQ0FBQyxJQUFJLEVBQUUsa0JBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwRixDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBVSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHNCQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDakcsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlDLENBQUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxpQkFBaUIsRUFDbkQsQ0FBQyxXQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFJLDhCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pFLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMscUJBQXFCLEVBQ3ZELENBQUMsV0FBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxzQ0FBcUIsQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM3RSxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGlCQUFpQixFQUNuRCxDQUFDLFdBQXdCLEVBQUUsRUFBRSxDQUFDLElBQUksOEJBQWlCLENBQUMsV0FBVyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDekUsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JELENBQUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxrQkFBa0IsRUFDcEQsQ0FBQyxXQUF3QixFQUFFLEVBQUUsQ0FBQyxJQUFJLGdDQUFrQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQzFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyRCxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsa0JBQWtCLEVBQ3BELENBQUMsV0FBd0IsRUFBRSxFQUFFLENBQUMsSUFBSSxnQ0FBa0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMxRSxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckQsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLFlBQVksRUFDOUMsQ0FBQyxHQUFRLEVBQUUsaUJBQW9DLEVBQUUsT0FBZ0IsRUFBRSxFQUFFLENBQ2pFLElBQUksc0JBQVksQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQzdELENBQUM7Z0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBUSxDQUFDLGlCQUFpQixFQUFFLGtCQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0YsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLElBQUksRUFDdEMsQ0FBQyxHQUFRLEVBQUUsUUFBa0IsRUFBRSxPQUFnQixFQUFFLFlBQTBCLEVBQUUsRUFBRSxDQUMzRSxJQUFJLGNBQUksQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMzRCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsUUFBUSxFQUFFLGtCQUFRLENBQUMsT0FBTyxFQUFFLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekcsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQVksRUFBRSxpQkFBb0MsRUFBRSxFQUFFLENBQ25HLElBQUksa0JBQVEsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxHQUFHLENBQUMsRUFDOUMsQ0FBQztnQkFDQyxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsS0FBSyxFQUFFLGtCQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUMzRSxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsWUFBWSxFQUM5QyxDQUFDLFFBQWtCLEVBQUUsaUJBQW9DLEVBQUUsRUFBRSxDQUN6RCxJQUFJLHNCQUFZLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQ3pELENBQUM7Z0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLFFBQVEsRUFBRSxrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDOUUsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGNBQWMsRUFDaEQsQ0FBQyxZQUEwQixFQUFFLFdBQXdCLEVBQUUsYUFBNEIsRUFBRSxFQUFFLENBQ25GLElBQUksd0JBQWMsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUN4RSxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxZQUFZLEVBQUUsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsa0JBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNwRyxDQUFDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsY0FBYyxFQUNoRCxDQUNJLEtBQVksRUFDWixJQUFVLEVBQ1YsT0FBZ0IsRUFDaEIsWUFBMEIsRUFDMUIsaUJBQW9DLEVBQ3BDLE1BQWMsRUFDZCxXQUF3QixFQUN4QixhQUE0QixFQUM1QixjQUErQixFQUNqQyxFQUFFLENBQ0EsSUFBSSx3QkFBYyxDQUNkLEtBQUssRUFDTCxJQUFJLEVBQ0osT0FBTyxFQUNQLFlBQVksRUFDWixpQkFBaUIsRUFDakIsTUFBTSxFQUNOLFdBQVcsRUFDWCxhQUFhLEVBQ2IsY0FBYyxDQUFDLEVBQ3ZCLEdBQUcsQ0FBQyxFQUNOLENBQUM7Z0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDdEIsa0JBQVEsQ0FBQyxLQUFLLEVBQ2Qsa0JBQVEsQ0FBQyxJQUFJLEVBQ2Isa0JBQVEsQ0FBQyxPQUFPLEVBQ2hCLGtCQUFRLENBQUMsWUFBWSxFQUNyQixrQkFBUSxDQUFDLGlCQUFpQixFQUMxQixrQkFBUSxDQUFDLE1BQU0sRUFDZixrQkFBUSxDQUFDLFdBQVcsRUFDcEIsa0JBQVEsQ0FBQyxhQUFhLEVBQ3RCLGtCQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakMsQ0FBQztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGFBQWEsRUFBRSxDQUNqRCxHQUFRLEVBQ1IsUUFBa0IsRUFDbEIsT0FBZ0IsRUFDaEIsSUFBVSxFQUNWLGlCQUFvQyxFQUFFLEVBQUUsQ0FDeEMsSUFBSSx1QkFBYSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUMxRSxDQUFDO2dCQUNDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQ3RCLGtCQUFRLENBQUMsR0FBRyxFQUNaLGtCQUFRLENBQUMsUUFBUSxFQUNqQixrQkFBUSxDQUFDLE9BQU8sRUFDaEIsa0JBQVEsQ0FBQyxJQUFJLEVBQ2Isa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDTCxDQUFDO1FBRU8sY0FBYztZQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUFDLENBQUM7WUFDakUsTUFBTSxDQUFDLFFBQVEsR0FBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUErQixDQUFDO1FBQ2pGLENBQUM7UUFHUyxNQUFNLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR3ZELFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0QsYUFBYSxDQUNuQixZQUFvQixJQUFJLEVBQ3hCLFVBQWUsSUFBSSxFQUNuQixVQUFtQixLQUFLLEVBQ3hCLFlBQXFCLEtBQUs7WUFFMUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBaUIsa0JBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNoRixjQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDekQsSUFBSSxDQUFDO2dCQUNELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0QixDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDYixLQUFLLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUNELGNBQWMsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV0RCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNWLENBQUMsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5RCxJQUFJLGdCQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFDLENBQUM7WUFDL0QsQ0FBQztZQUVELGlEQUFpRDtRQUNyRCxDQUFDO1FBRU0sVUFBVTtZQUNiLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFeEQsNkRBQTZEO1lBQzdELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQU8sa0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFlLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDeEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBUyxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQVUsa0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDL0MsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBTyxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7WUFDdEQsdUhBQXVIO1lBQ3ZILElBQUksQ0FBQyxVQUFVLENBQVMsa0JBQVEsQ0FBQyxNQUFNLENBQUM7aUJBQ25DLGFBQWEsQ0FBQyxDQUFDLENBQUMscURBQXFELENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQy9ELGtCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFVBQVUsQ0FBYyxrQkFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsQ0FDekQsQ0FBQyxDQUFDLHlCQUF5QixDQUFDO2lCQUMzQixHQUFHLENBQUMsWUFBWSxDQUFDO2lCQUNqQixHQUFHLENBQUMsV0FBVyxDQUFDO2lCQUNoQixHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBRW5DLElBQUksQ0FBQyxVQUFVLENBQWdCLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsVUFBVSxDQUM3RCxDQUFDLENBQUMsOENBQThDLENBQUM7aUJBQ2hELEdBQUcsQ0FBQyxZQUFZLENBQUM7aUJBQ2pCLEdBQUcsQ0FBQyxXQUFXLENBQUM7aUJBQ2hCLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFFbkMsSUFBSSxDQUFDLFVBQVUsQ0FBa0Isa0JBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUU3RixDQUFDLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQzlFLENBQUMsQ0FBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFFckcsb0RBQW9EO1lBQ3BELHVCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLFVBQVUsQ0FBc0Isa0JBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQzNHLElBQUksQ0FBQyxVQUFVLENBQTZCLGtCQUFRLENBQUMsMEJBQTBCLENBQUM7aUJBQzNFLE1BQU0sQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxVQUFVLENBQXNCLGtCQUFRLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztZQUMxRyxJQUFJLENBQUMsVUFBVSxDQUFvQixrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUM7WUFDL0gsSUFBSSxDQUFDLFVBQVUsQ0FBd0Isa0JBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO1lBQzdILElBQUksQ0FBQyxVQUFVLENBQXFCLGtCQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQztZQUNwSCxJQUFJLENBQUMsVUFBVSxDQUFxQixrQkFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDekcsc0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsVUFBVSxDQUFvQixrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDdkcsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFnQixrQkFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsbURBQW1ELENBQUMsQ0FBQyxDQUFDO1lBQ3RILElBQUksQ0FBQyxVQUFVLENBQW9CLGtCQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsVUFBVSxDQUFvQixrQkFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDcEcseUJBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoRCxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUVsQyw2REFBNkQ7WUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBVyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFlLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDaEcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFFakQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZ0Isa0JBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzlHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsNEZBQTRGLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzdLLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsMkRBQTJELENBQUMsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsMklBQTJJLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRS9OLElBQUksQ0FBQyxVQUFVLENBQWUsa0JBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzNFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUVyRCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUUxQyxJQUFJLENBQUM7Z0JBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLENBQUM7UUFDMUYsQ0FBQztRQUVTLG9CQUFvQjtZQUMxQixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUN0QyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUUvRCx3QkFBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVTLHdCQUF3QixDQUFDLElBQVU7WUFDekMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDMUQsQ0FBQztRQUVTLGlCQUFpQjtZQUN2QixNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUNuQyxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMscUNBQXFDLENBQUMsQ0FBQztZQUU1RCxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVTLE1BQU0sQ0FBQyxNQUFNO1lBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQU0sa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLFNBQVMsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztnQkFDOUQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN2QixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFlLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2SSxDQUFDO2lCQUFNLENBQUM7Z0JBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUFDLENBQUM7WUFFOUIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVTLDBCQUEwQixLQUFZLENBQUM7UUFFdkMsT0FBTyxDQUFDLFVBQVUsR0FBRyxLQUFLO1lBQ2hDLDBEQUEwRDtZQUMxRCw0RUFBNEU7WUFDNUUsMkRBQTJEO1lBQzNELHlFQUF5RTtZQUN6RSxXQUFXO1lBQ1gseUJBQXlCO1lBQ3pCLElBQUk7WUFDSixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbEIsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUVNLFVBQVUsQ0FBcUIsR0FBVztZQUM3QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FDSjtJQXBhRCw0QkFvYUM7O0FJcmRELGlEQUFpRDtBQUNqRCx3REFBd0Q7QUFDeEQsc0RBQXNEO0FBQ3RELDRDQUE0QztBQUM1Qyw2Q0FBNkM7QUFDN0Msb0VBQW9FO0FBQ3BFLDhDQUE4QztBQUM5Qyx1REFBdUQ7QUFDdkQsK0NBQStDO0FBQy9DLDZDQUE2QztBQUM3QyxpREFBaUQ7QUFFakQsK0RBQStEO0FBQy9ELG1CQUFtQjtBQUNuQixvQ0FBb0M7QUFDcEMsNENBQTRDO0FBQzVDLDhCQUE4QjtBQUM5QixrQ0FBa0M7QUFDbEMsZ0NBQWdDO0FBQ2hDLDBEQUEwRDtBQUMxRCxnREFBZ0Q7QUFDaEQsOENBQThDO0FBQzlDLGlEQUFpRDtBQUNqRCxZQUFZO0FBRVoscUVBQXFFO0FBQ3JFLDZKQUE2SjtBQUM3SiwyR0FBMkc7QUFDM0csbUlBQW1JO0FBQ25JLElBQUk7QUM3QkosaURBQWlEO0FBQ2pELG1EQUFtRDtBQUNuRCwyREFBMkQ7QUFDM0QsMkNBQTJDO0FBQzNDLHlDQUF5QztBQUN6QyxvQ0FBb0M7QUFDcEMsd0RBQXdEO0FBQ3hELHFEQUFxRDtBQUNyRCxxREFBcUQ7QUFFckQsMkNBQTJDO0FBQzNDLHlCQUF5QjtBQUN6QixvQkFBb0I7QUFDcEIsMEJBQTBCO0FBQzFCLElBQUk7QUFFSix3REFBd0Q7QUFDeEQsZ0RBQWdEO0FBQ2hELDhEQUE4RDtBQUM5RCxvREFBb0Q7QUFFcEQsd0VBQXdFO0FBRXhFLG1CQUFtQjtBQUNuQiw0QkFBNEI7QUFDNUIsc0NBQXNDO0FBQ3RDLDhDQUE4QztBQUM5QyxrREFBa0Q7QUFDbEQsOEJBQThCO0FBQzlCLG9DQUFvQztBQUNwQyxnREFBZ0Q7QUFFaEQsMEZBQTBGO0FBQzFGLHdDQUF3QztBQUN4Qyx1QkFBdUI7QUFDdkIsb0RBQW9EO0FBQ3BELDRGQUE0RjtBQUM1Rix5REFBeUQ7QUFDekQsZ0NBQWdDO0FBQ2hDLGtCQUFrQjtBQUNsQixRQUFRO0FBRVIsc0pBQXNKO0FBRXRKLHlDQUF5QztBQUN6QyxnREFBZ0Q7QUFDaEQsa0VBQWtFO0FBQ2xFLHdHQUF3RztBQUV4RyxxREFBcUQ7QUFDckQsd0ZBQXdGO0FBQ3hGLDZFQUE2RTtBQUU3RSxpQ0FBaUM7QUFDakMsa0dBQWtHO0FBQ2xHLDZDQUE2QztBQUM3Qyx3QkFBd0I7QUFDeEIsUUFBUTtBQUVSLHFFQUFxRTtBQUVyRSxnREFBZ0Q7QUFDaEQsMkVBQTJFO0FBQzNFLGtFQUFrRTtBQUVsRSxtR0FBbUc7QUFDbkcsb0VBQW9FO0FBQ3BFLDJGQUEyRjtBQUMzRixnRUFBZ0U7QUFDaEUscURBQXFEO0FBQ3JELGlEQUFpRDtBQUVqRCx5RUFBeUU7QUFFekUsNEZBQTRGO0FBQzVGLHdIQUF3SDtBQUV4SCx3REFBd0Q7QUFFeEQsbUJBQW1CO0FBQ25CLDhCQUE4QjtBQUM5QixnRUFBZ0U7QUFDaEUsb0RBQW9EO0FBQ3BELGdDQUFnQztBQUNoQyx5Q0FBeUM7QUFDekMsMEpBQTBKO0FBQzFKLGtEQUFrRDtBQUNsRCw0QkFBNEI7QUFDNUIsbUNBQW1DO0FBQ25DLHlEQUF5RDtBQUN6RCxvQkFBb0I7QUFDcEIsaUJBQWlCO0FBQ2pCLGlDQUFpQztBQUNqQywwREFBMEQ7QUFDMUQsZ0VBQWdFO0FBQ2hFLGtFQUFrRTtBQUVsRSx3SEFBd0g7QUFFeEgsbUVBQW1FO0FBQ25FLHlHQUF5RztBQUN6Ryx5Q0FBeUM7QUFDekMsb0JBQW9CO0FBRXBCLGdIQUFnSDtBQUNoSCx1REFBdUQ7QUFDdkQsZ0JBQWdCO0FBQ2hCLGNBQWM7QUFFZCx3QkFBd0I7QUFDeEIsUUFBUTtBQUVSLHVGQUF1RjtBQUN2RiwrQkFBK0I7QUFFL0IseUNBQXlDO0FBRXpDLHNCQUFzQjtBQUN0QixnREFBZ0Q7QUFDaEQsd0NBQXdDO0FBQ3hDLGdCQUFnQjtBQUNoQixxREFBcUQ7QUFDckQsa0RBQWtEO0FBQ2xELDhEQUE4RDtBQUM5RCw2Q0FBNkM7QUFDN0MsZ0JBQWdCO0FBQ2hCLGdDQUFnQztBQUNoQyxZQUFZO0FBQ1osd0NBQXdDO0FBQ3hDLDJEQUEyRDtBQUMzRCxRQUFRO0FBR1IsZ0ZBQWdGO0FBRWhGLHVDQUF1QztBQUV2QyxzQ0FBc0M7QUFDdEMsMERBQTBEO0FBQzFELHNCQUFzQjtBQUN0QixZQUFZO0FBRVosK0NBQStDO0FBQy9DLHNEQUFzRDtBQUN0RCw0REFBNEQ7QUFDNUQsc0JBQXNCO0FBQ3RCLFlBQVk7QUFFWixpRUFBaUU7QUFDakUsdUVBQXVFO0FBQ3ZFLHNEQUFzRDtBQUN0RCw0REFBNEQ7QUFDNUQsc0JBQXNCO0FBQ3RCLFlBQVk7QUFFWiw2REFBNkQ7QUFDN0Qsa0VBQWtFO0FBQ2xFLDhHQUE4RztBQUU5Ryx5Q0FBeUM7QUFDekMsZ0dBQWdHO0FBRWhHLDJDQUEyQztBQUMzQyxrRUFBa0U7QUFDbEUsdURBQXVEO0FBQ3ZELDREQUE0RDtBQUM1RCxzQkFBc0I7QUFDdEIsWUFBWTtBQUVaLDZCQUE2QjtBQUM3Qiw0REFBNEQ7QUFDNUQsUUFBUTtBQUVSLG9GQUFvRjtBQUNwRix5R0FBeUc7QUFDekcsUUFBUTtBQUdSLDREQUE0RDtBQUU1RCwrRkFBK0Y7QUFDL0YsdUdBQXVHO0FBQ3ZHLGdEQUFnRDtBQUNoRCwyREFBMkQ7QUFFM0QsZ0VBQWdFO0FBQ2hFLDBDQUEwQztBQUMxQyxrREFBa0Q7QUFDbEQscURBQXFEO0FBRXJELHdDQUF3QztBQUN4QyxtRUFBbUU7QUFDbkUsc0ZBQXNGO0FBQ3RGLGdKQUFnSjtBQUVoSiw0Q0FBNEM7QUFDNUMsb0JBQW9CO0FBQ3BCLDRHQUE0RztBQUM1RywyR0FBMkc7QUFDM0csb0JBQW9CO0FBQ3BCLGtCQUFrQjtBQUNsQixZQUFZO0FBQ1osZUFBZTtBQUNmLHdGQUF3RjtBQUN4RixRQUFRO0FBRVIsb0ZBQW9GO0FBRXBGLHlDQUF5QztBQUV6QyxpREFBaUQ7QUFDakQseURBQXlEO0FBRXpELCtDQUErQztBQUUvQywyQ0FBMkM7QUFDM0MsMkRBQTJEO0FBQzNELGlDQUFpQztBQUNqQyxjQUFjO0FBRWQsdUVBQXVFO0FBQ3ZFLGdFQUFnRTtBQUNoRSxnREFBZ0Q7QUFFaEQsb0NBQW9DO0FBQ3BDLHVEQUF1RDtBQUN2RCwwREFBMEQ7QUFDMUQsZ0JBQWdCO0FBQ2hCLHFCQUFxQjtBQUNyQix3REFBd0Q7QUFDeEQseURBQXlEO0FBQ3pELGdCQUFnQjtBQUVoQix1Q0FBdUM7QUFDdkMsb0NBQW9DO0FBQ3BDLDBGQUEwRjtBQUMxRix1RUFBdUU7QUFDdkUsdUJBQXVCO0FBQ3ZCLFlBQVk7QUFDWixpQkFBaUI7QUFDakIsNENBQTRDO0FBQzVDLHNFQUFzRTtBQUN0RSxZQUFZO0FBQ1osUUFBUTtBQUVSLGtFQUFrRTtBQUNsRSwwQ0FBMEM7QUFDMUMsOERBQThEO0FBQzlELHFDQUFxQztBQUNyQyx3REFBd0Q7QUFDeEQsdUNBQXVDO0FBQ3ZDLGdGQUFnRjtBQUNoRix1Q0FBdUM7QUFDdkMsNERBQTREO0FBQzVELDRFQUE0RTtBQUM1RSxvQkFBb0I7QUFDcEIseUJBQXlCO0FBQ3pCLHNFQUFzRTtBQUN0RSwrQ0FBK0M7QUFDL0MsMkNBQTJDO0FBQzNDLGdFQUFnRTtBQUNoRSxnRkFBZ0Y7QUFDaEYsMEJBQTBCO0FBQzFCLG9CQUFvQjtBQUNwQixrQkFBa0I7QUFDbEIsWUFBWTtBQUNaLGlFQUFpRTtBQUVqRSx3REFBd0Q7QUFFeEQsaUNBQWlDO0FBQ2pDLDZDQUE2QztBQUM3QyxzRUFBc0U7QUFDdEUsMERBQTBEO0FBQzFELGtEQUFrRDtBQUNsRCxjQUFjO0FBQ2QsUUFBUTtBQUNSLElBQUkifQ==