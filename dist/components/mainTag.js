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
            this.responseProcessor.processCompleted.handle(function () { return _this.tryOpenFromUrl(); });
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
            // if (this.url.isAbsolute(url)) {
            //     const pathArray: string[] = url.split("/").splice(3);
            //     url = pathArray.join("/");
            // }
            var mainTagUrl = this.url.addQuery(currentPath, "_" + mainTagName, encodeURIComponent(url));
            history.pushState({}, "", mainTagUrl);
        };
        MainTagHelper.prototype.render = function (event, url) {
            var target = $(event.currentTarget);
            var mainTagUrl = url ? url : target.attr("href");
            var mainTagName = target.attr("target").replace("$", "");
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName).render();
        };
        MainTagHelper.prototype.openWithUrl = function (mainTagName) {
            var mainTagUrl = this.url.getQuery("_" + mainTagName).toLowerCase();
            new MainTag(this.url, this.ajaxRedirect, this, mainTagUrl, mainTagName).render(false);
        };
        return MainTagHelper;
    }());
    exports.MainTagHelper = MainTagHelper;
    var MainTag = /** @class */ (function () {
        function MainTag(urlService, ajaxRedirect, helper, url, mainTagName) {
            this.urlService = urlService;
            this.ajaxRedirect = ajaxRedirect;
            this.helper = helper;
            this.url = url;
            this.mainTagName = mainTagName;
            this.element = $("main[name='$" + this.mainTagName + "']");
        }
        MainTag.prototype.onComplete = function (success) {
            this.helper.data[this.mainTagName].status = success ? "loaded" : "failed";
        };
        MainTag.prototype.render = function (changeUrl) {
            var _this = this;
            if (changeUrl === void 0) { changeUrl = true; }
            if (!this.element || !this.element.length || !this.url || !this.isValidUrl(this.url)) {
                return;
            }
            this.url = this.urlService.effectiveUrlProvider(this.url, null);
            var urlData = this.helper.data[this.mainTagName];
            if (urlData) {
                if (urlData.url === this.url &&
                    (urlData.status === "loading" ||
                        urlData.status === "loaded")) {
                    return;
                }
            }
            else {
                this.helper.data[this.mainTagName] = {};
            }
            console.log(this.url, this.mainTagName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL21haW5UYWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBU0E7UUFHSSx1QkFDWSxHQUFRLEVBQ1IsWUFBMEIsRUFDMUIsaUJBQW9DO1lBRnBDLFFBQUcsR0FBSCxHQUFHLENBQUs7WUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBYztZQUMxQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBTHpDLFNBQUksR0FBK0IsRUFBRSxDQUFDO1FBTXpDLENBQUM7UUFFRSxrQ0FBVSxHQUFqQixVQUFrQixRQUFnQjtZQUFsQyxpQkFRQztZQVBHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFDLENBQUM7Z0JBQ2hDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNwQixDQUFDLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDN0IsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDZixPQUFPLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFTSxrQ0FBVSxHQUFqQjtZQUFBLGlCQUdDO1lBRkcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsY0FBYyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBRU0sc0NBQWMsR0FBckI7WUFBQSxpQkFPQztZQU5HLElBQUksUUFBUSxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNoRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssRUFBRSxHQUFHO2dCQUMzRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3hELEtBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUN0QztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVNLGlDQUFTLEdBQWhCLFVBQWlCLEdBQVcsRUFBRSxXQUFtQjtZQUU3QyxJQUFJLFdBQVcsR0FBVyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsQ0FBQztZQUV0RixJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzNCLFdBQVcsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFDO1lBRUQsa0NBQWtDO1lBQ2xDLDREQUE0RDtZQUM1RCxpQ0FBaUM7WUFDakMsSUFBSTtZQUVKLElBQUksVUFBVSxHQUFXLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsV0FBVyxFQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFcEcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLENBQUM7UUFFTSw4QkFBTSxHQUFiLFVBQWMsS0FBeUIsRUFBRSxHQUFZO1lBQ2pELElBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdEMsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3JGLENBQUM7UUFFUyxtQ0FBVyxHQUFyQixVQUFzQixXQUFtQjtZQUVyQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFDTCxvQkFBQztJQUFELENBQUMsQUEvREQsSUErREM7SUEvRFksc0NBQWE7SUFpRTFCO1FBR0ksaUJBQ1ksVUFBZSxFQUNmLFlBQTBCLEVBQzFCLE1BQXFCLEVBQ3JCLEdBQVcsRUFDWCxXQUFtQjtZQUpuQixlQUFVLEdBQVYsVUFBVSxDQUFLO1lBQ2YsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDMUIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtZQUNyQixRQUFHLEdBQUgsR0FBRyxDQUFRO1lBQ1gsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFFM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVNLDRCQUFVLEdBQWpCLFVBQWtCLE9BQWdCO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztRQUM5RSxDQUFDO1FBRU0sd0JBQU0sR0FBYixVQUFjLFNBQXlCO1lBQXZDLGlCQWtDQztZQWxDYSwwQkFBQSxFQUFBLGdCQUF5QjtZQUVuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsRixPQUFPO2FBQ1Y7WUFFRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVoRSxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkQsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsSUFBSSxPQUFPLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHO29CQUN4QixDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssU0FBUzt3QkFDekIsT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsRUFBRTtvQkFDbEMsT0FBTztpQkFDVjthQUNKO2lCQUFNO2dCQUNILElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFhLENBQUM7YUFDdEQ7WUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBRXZDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNsRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztZQUV0RCxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUN6QixJQUFJLENBQUMsT0FBTyxFQUNaLEtBQUssRUFDTCxLQUFLLEVBQ0wsS0FBSyxFQUNMLFVBQUMsT0FBZ0I7Z0JBQ2IsS0FBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDekIsSUFBSSxTQUFTO29CQUNULEtBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFELENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVTLDRCQUFVLEdBQXBCLFVBQXFCLFVBQWtCO1lBRW5DLGNBQWM7WUFDZCxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3BDLEtBQUssQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO2dCQUM5RCxPQUFPLEtBQUssQ0FBQzthQUNoQjtZQUVELDJCQUEyQjtZQUMzQixJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUU3RSxJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBQy9DLElBQUksZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUM7Z0JBRWxFLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRTtvQkFDakMsS0FBSyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7b0JBQzlELE9BQU8sS0FBSyxDQUFDO2lCQUNoQjthQUNKO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNMLGNBQUM7SUFBRCxDQUFDLEFBMUVELElBMEVDIn0=