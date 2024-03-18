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
            const width = $(window).width();
            const mobileBreakpoint = 800;
            let oldMain = trigger.closest("main");
            let targetMainName = trigger.attr("target");
            if (targetMainName) {
                oldMain = $("main[name='" + targetMainName + "']");
                if (oldMain.length === 0)
                    console.error("There is no <main> object with the name of '" + targetMainName + "'.");
            }
            else
                targetMainName = oldMain.attr("name");
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
            // backward compatibility
            if (transition == "slide")
                transition = "slide-mobile";
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
                default:
                    console.error(`transition '${transition}' not defined.`);
                    break;
            }
            this.replaceContent(referencedScripts, trigger, newMain, oldMain, enterClass, exitClass);
        }
        replaceContent(referencedScripts, trigger, newMain, oldMain, enterClass, exitClass) {
            if (exitClass)
                oldMain.addClass(exitClass);
            oldMain.replaceWith(newMain);
            if (enterClass)
                newMain.addClass(enterClass);
            this.updateUrl(referencedScripts, newMain, trigger);
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
define("olive/components/mainTag", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainTagHelper = void 0;
    class MainTagHelper {
        constructor(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.state = undefined;
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
                if (!this.tryOpenFromUrl()) {
                    this.tryOpenDefaultUrl();
                }
            });
        }
        tryOpenFromUrl() {
            this.validateState();
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
            this.validateState();
            var tags = $("main[name^='$'][data-default-url]");
            // at least one content loaded
            let result = false;
            for (let i = 0; i < tags.length; i++) {
                const main = $(tags[i]);
                const mainTagName = main.attr("name").substring(1);
                if (this.state.foundQs.indexOf(mainTagName) !== -1)
                    continue;
                const url = main.attr("data-default-url");
                main.attr("data-default-url", undefined);
                if (url && this.openWithUrl(mainTagName, url)) {
                    this.state.foundQs.push(mainTagName);
                    result = true;
                }
            }
            return result;
        }
        changeUrl(url, mainTagName) {
            this.validateState();
            let currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            var children = $("main[name='$" + mainTagName + "']").attr("data-children");
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
            let mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, this.url.encodeGzipUrl(url));
            history.pushState({}, "", mainTagUrl);
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
            const mainTagUrl = url ? url : this.url.getQuery("_" + mainTagName);
            const element = $("main[name='$" + mainTagName + "']");
            if (!mainTagUrl || !element || !element.length)
                return false;
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, element, mainTagName, undefined).render(false);
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
        }
        render(changeUrl = true) {
            var _a;
            if (!this.url)
                return;
            const back = ((_a = this.trigger) === null || _a === void 0 ? void 0 : _a.attr("data-back")) === "true";
            this.ajaxRedirect.go(this.url, this.element, back, false, false, (success) => {
                if (success && changeUrl) {
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
define("olive/mvc/ajaxRedirect", ["require", "exports", "olive/di/services"], function (require, exports, services_1) {
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
                window.page.getService(services_1.default.MainTagHelper)
                    .changeUrl(url, mainTag.attr("name").replace("$", ""));
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
            console.log("BACK", this.ajaxRedirect.ajaxChangedUrl, location.href);
            if (this.modalHelper.isOrGoingToBeModal()) {
                this.modalHelper.close();
                return;
            }
            if (this.ajaxRedirect.ajaxChangedUrl == 0)
                return;
            this.ajaxRedirect.ajaxChangedUrl--;
            const link = $(event.currentTarget);
            if (link && link.length && link.prop("tagName") == "A") {
                let ajaxTarget = link.attr("ajax-target");
                let ajaxhref = link.attr("href");
                this.ajaxRedirect.go(location.href, null, true, false, false, undefined, ajaxTarget, ajaxhref);
                return;
            }
            this.ajaxRedirect.go(location.href, null, true, false, false, undefined, undefined, undefined);
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
define("olive/olivePage", ["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/responseProcessor", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/mvc/serverInvoker", "olive/mvc/windowEx", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "olive/plugins/multiSelect", "olive/plugins/customCheckbox", "olive/plugins/customRadio", "olive/plugins/ckEditorFileManager", "olive/components/grouping", "olive/di/serviceContainer", "olive/di/services", "olive/plugins/sanityAdapter", "olive/plugins/testingContext", "olive/components/mainTag"], function (require, exports, config_8, crossDomainEvent_4, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_2, sanityAdapter_1, testingContext_1, mainTag_1) {
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
            if (services.tryAddSingleton(services_2.default.WindowEx, (modalHelper, ajaxRedirect) => new windowEx_1.default(modalHelper, ajaxRedirect), out)) {
                out.value.withDependencies(services_2.default.ModalHelper, services_2.default.AjaxRedirect);
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
                out.value.withDependencies(services_2.default.Alert, services_2.default.Form, services_2.default.Waiting, services_2.default.AjaxRedirect, services_2.default.ResponseProcessor, services_2.default.Select, services_2.default.ModalHelper, services_2.default.ServiceLocator);
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
            this.getService(services_2.default.ModalHelper).enableLink($("[target='$modal'][href]"));
            this.getService(services_2.default.MainTagHelper).enableLink($("[target^='$']:not([target = '$modal'])[href]"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiLCIuLi9zcmMvY29tcG9uZW50cy9saXRlRXZlbnQudHMiLCIuLi9zcmMvbXZjL3Jlc3BvbnNlUHJvY2Vzc29yLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvdXJsLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvd2FpdGluZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiLCIuLi9zcmMvZGkvc2VydmljZXMudHMiLCIuLi9zcmMvbXZjL2FqYXhSZWRpcmVjdC50cyIsIi4uL3NyYy9jb21wb25lbnRzL2FsZXJ0LnRzIiwiLi4vc3JjL3BsdWdpbnMvc2VsZWN0LnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvbW9kYWwudHMiLCIuLi9zcmMvY29tcG9uZW50cy92YWxpZGF0ZS50cyIsIi4uL3NyYy9jb21wb25lbnRzL2Zvcm0udHMiLCIuLi9zcmMvbXZjL3N0YW5kYXJkQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9zZXJ2ZXJJbnZva2VyLnRzIiwiLi4vc3JjL212Yy93aW5kb3dFeC50cyIsIi4uL3NyYy9leHRlbnNpb25zL2pRdWVyeUV4dGVuc2lvbnMudHMiLCIuLi9zcmMvZXh0ZW5zaW9ucy9zeXN0ZW1FeHRlbnNpb25zLnRzIiwiLi4vc3JjL2NvbXBvbmVudHMvc29ydGluZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL3BhZ2luZy50cyIsIi4uL3NyYy9jb21wb25lbnRzL21hc3RlckRldGFpbC50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyaWQudHMiLCIuLi9zcmMvcGx1Z2lucy9wYXNzd29yZFN0ZW5ndGgudHMiLCIuLi9zcmMvcGx1Z2lucy9odG1sRWRpdG9yLnRzIiwiLi4vc3JjL3BsdWdpbnMvdGltZUNvbnRyb2wudHMiLCIuLi9zcmMvcGx1Z2lucy9hdXRvQ29tcGxldGUudHMiLCIuLi9zcmMvcGx1Z2lucy9nbG9iYWxTZWFyY2gudHMiLCIuLi9zcmMvcGx1Z2lucy9zbGlkZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlVGltZVBpY2tlckJhc2UudHMiLCIuLi9zcmMvcGx1Z2lucy9kYXRlUGlja2VyLnRzIiwiLi4vc3JjL3BsdWdpbnMvZGF0ZVRpbWVQaWNrZXIudHMiLCIuLi9zcmMvcGx1Z2lucy9udW1lcmljVXBEb3duLnRzIiwiLi4vc3JjL3BsdWdpbnMvZmlsZVVwbG9hZC50cyIsIi4uL3NyYy9wbHVnaW5zL2NvbmZpcm1Cb3gudHMiLCIuLi9zcmMvcGx1Z2lucy9zdWJNZW51LnRzIiwiLi4vc3JjL3BsdWdpbnMvaW5zdGFudFNlYXJjaC50cyIsIi4uL3NyYy9wbHVnaW5zL2RhdGVEcm9wZG93bi50cyIsIi4uL3NyYy9wbHVnaW5zL3VzZXJIZWxwLnRzIiwiLi4vc3JjL3BsdWdpbnMvbXVsdGlTZWxlY3QudHMiLCIuLi9zcmMvcGx1Z2lucy9jdXN0b21DaGVja2JveC50cyIsIi4uL3NyYy9wbHVnaW5zL2N1c3RvbVJhZGlvLnRzIiwiLi4vc3JjL3BsdWdpbnMvY2tFZGl0b3JGaWxlTWFuYWdlci50cyIsIi4uL3NyYy9jb21wb25lbnRzL2dyb3VwaW5nLnRzIiwiLi4vc3JjL2RpL3NlcnZpY2VEZXNjcmlwdGlvbi50cyIsIi4uL3NyYy9kaS9zZXJ2aWNlQ29udGFpbmVyLnRzIiwiLi4vc3JjL3BsdWdpbnMvc2FuaXR5QWRhcHRlci50cyIsIi4uL3NyYy9wbHVnaW5zL3Rlc3RpbmdDb250ZXh0LnRzIiwiLi4vc3JjL29saXZlUGFnZS50cyIsIi4uL3NyYy9kaS9JU2VydmljZS50cyIsIi4uL3NyYy9kaS9pU2VydmljZUxvY2F0b3IudHMiLCIuLi9zcmMvZGkvb3V0UGFyYW0udHMiLCIuLi9zcmMvbXZjL2NvbWJpbmVkVXRpbGl0aWVzLnRzIiwiLi4vc3JjL212Yy9mb3JtQWN0aW9uLnRzIiwiLi4vc3JjL212Yy9pSW52b2NhdGlvbkNvbnRleHQudHMiLCIuLi9zcmMvbXZjL2ludGVy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