define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainTagHelper = void 0;
    var MainTagHelper = /** @class */ (function () {
        function MainTagHelper(url, ajaxRedirect, responseProcessor) {
            this.url = url;
            this.ajaxRedirect = ajaxRedirect;
            this.responseProcessor = responseProcessor;
            this.data = {};
        }
        MainTagHelper.prototype.enableLink = function (selector) {
            var _this = this;
            selector.off("click").on("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                _this.render(e);
                return false;
            });
        };
        MainTagHelper.prototype.initialize = function () {
            var _this = this;
            this.data = {};
            this.responseProcessor.processCompleted.handle(function (e) {
                _this.tryOpenFromUrl();
            });
        };
        MainTagHelper.prototype.tryOpenFromUrl = function () {
            var _this = this;
            var reserved = ["_modal", "_nav", "_returnUrl"];
            new URLSearchParams(window.location.search).forEach(function (value, key) {
                if (key.indexOf("_") === 0 && reserved.indexOf(key) === -1) {
                    _this.openWithUrl(key.substring(1));
                }
            });
        };
        MainTagHelper.prototype.changeUrl = function (url, mainTagName) {
            var currentPath = this.url.removeQuery(this.url.current(), "_" + mainTagName);
            if (currentPath.endsWith("?")) {
                currentPath = currentPath.trimEnd("?");
            }
            var mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, encodeURIComponent(url));
            history.pushState({}, "", mainTagUrl);
        };
        MainTagHelper.prototype.render = function (event, url) {
            var target = $(event.currentTarget);
            var mainTagUrl = url ? url : target.attr("href");
            var mainTagName = target.attr("target").replace("$", "");
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName, target).render();
        };
        MainTagHelper.prototype.openWithUrl = function (mainTagName) {
            var mainTagUrl = this.url.getQuery("_" + mainTagName).toLowerCase();
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName, undefined).render(false);
        };
        return MainTagHelper;
    }());
    exports.MainTagHelper = MainTagHelper;
    var MainTag = /** @class */ (function () {
        function MainTag(urlService, ajaxRedirect, helper, baseUrl, mainTagName, trigger) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.mainTagName = mainTagName;
            this.trigger = trigger;
            if (!this.isValidUrl(baseUrl)) {
                return;
            }
            if (this.urlService.isAbsolute(baseUrl)) {
                var pathArray = baseUrl.split("/").splice(3);
                this.url = pathArray.join("/");
            }
            else {
                this.url = baseUrl;
            }
            this.element = $("main[name='$" + this.mainTagName + "']");
        }
        MainTag.prototype.onComplete = function (success) {
            this.helper.data[this.mainTagName].status = success ? "loaded" : "failed";
        };
        MainTag.prototype.render = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            if (!this.element || !this.element.length || !this.url) {
                return;
            }
            var urlData = this.helper.data[this.mainTagName];
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
            this.ajaxRedirect.go(this.url, this.element, false, false, false, function (success) {
                _this.onComplete(success);
                if (changeUrl)
                    _this.helper.changeUrl(_this.url, _this.mainTagName);
            });
        };
        MainTag.prototype.isValidUrl = function (mainTagUrl) {
            // Prevent XSS
            if (mainTagUrl.contains("javascript:")) {
                alert("Dangerous script detected!!! Request is now aborted!");
                return false;
            }
            // Prevent Open Redirection
            if (mainTagUrl.indexOf("http://") === 0 || mainTagUrl.indexOf("https://") === 0) {
                var newHostName = new URL(mainTagUrl).hostname;
                var currentHostName = new URL(this.urlService.current()).hostname;
                if (newHostName !== currentHostName) {
                    alert("Dangerous script detected!!! Request is now aborted!");
                    return false;
                }
            }
            return true;
        };
        return MainTag;
    }());
    exports.default = MainTag;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0E7UUFHSSx1QkFDWSxHQUFRLEVBQ1IsWUFBMEIsRUFDMUIsaUJBQW9DO1lBRnBDLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUMxQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBTHpDLFNBQUksR0FBK0IsRUFBRSxDQUFDO1FBTXpDLENBQUM7UUFFRSxrQ0FBVSxHQUFqQixVQUFrQixRQUFnQjtZQUFsQyxpQkFRQztZQVBHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNwQixDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDN0IsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxrQ0FBVSxHQUFqQjtZQUFBLGlCQUtDO1lBSkcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQUMsQ0FBQztnQkFDN0MsS0FBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzFCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVNLHNDQUFjLEdBQXJCO1lBQUEsaUJBT0M7WUFORyxJQUFJLFFBQVEsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEQsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLFFBQVEs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