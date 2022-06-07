define(["require", "exports", "olive/components/liteEvent"], function (require, exports, liteEvent_1) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2VQcm9jZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbXZjL3Jlc3BvbnNlUHJvY2Vzc29yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUE7UUFBQTtZQUNZLGlDQUE0QixHQUFHLEVBQUUsQ0FBQztZQUVuQyxtQkFBYyxHQUFHLElBQUksbUJBQVMsRUFBK0IsQ0FBQztZQUM5RCxnQkFBVyxHQUFHLElBQUksbUJBQVMsRUFBeUIsQ0FBQztZQUNyRCxxQkFBZ0IsR0FBRyxJQUFJLG1CQUFTLEVBQWMsQ0FBQztZQUMvQywwQkFBcUIsR0FBRyxJQUFJLG1CQUFTLEVBQStCLENBQUM7UUFrTGhGLENBQUM7UUFoTFUsK0NBQW1CLEdBQTFCLFVBQTJCLFFBQWEsRUFBRSxlQUF1QixFQUFFLE9BQWUsRUFBRSxJQUFTO1lBQ3pGLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUU1QixJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDeEMsT0FBTzthQUNWO1lBRUQsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUU7Z0JBQzFELGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QyxPQUFPO2FBQ1Y7WUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksZUFBZSxJQUFJLElBQUksRUFBRTtnQkFDNUUsU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxD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