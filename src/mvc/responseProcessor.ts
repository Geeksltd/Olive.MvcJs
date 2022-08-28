import LiteEvent from "olive/components/liteEvent";

export default class ResponseProcessor implements IService {
    private dynamicallyLoadedScriptFiles = [];

    public subformChanged = new LiteEvent<IResponseProcessorEventArgs>();
    public viewChanged = new LiteEvent<IViewUpdatedEventArgs>();
    public processCompleted = new LiteEvent<IEventArgs>();
    public nothingFoundToProcess = new LiteEvent<IResponseProcessorEventArgs>();

    public processAjaxResponse(response: any, containerModule: JQuery, trigger: JQuery, args: any, ajaxTarget?: string, ajaxhref?: string) {
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
    protected onNothingFoundToProcess(response: any, trigger: JQuery) {
        this.nothingFoundToProcess.raise({ response: response, trigger: trigger });
    }

    protected onSubformChanged(response: any, trigger: JQuery) {
        this.subformChanged.raise({ response: response, trigger: trigger });
    }

    protected onViewChanged(container: JQuery, trigger: JQuery, isNewPage: boolean = false) {
        this.viewChanged.raise({ container: container, trigger: trigger, isNewPage: isNewPage });
    }

    protected navigate(element: JQuery, trigger: JQuery, args: any) {
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
                $this.processWithTheContent(trigger, element, args, referencedScripts)
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

    protected navigatebyAjaxTarget(element: JQuery, ajaxTarget: string) {
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

    private getNewCss(element: JQuery): string[] {
        let referencedCss = this.getCss(element);
        let currentCss = this.getCss($("body"));

        return referencedCss.filter(x => currentCss.indexOf(x) === -1);
    }

    private getCss(parent: JQuery): string[] {
        let result = new Array<string>();
        parent.find("link[rel=stylesheet]").each((i, s) => result.push($(s).attr("href")));
        return result;
    }

    protected processWithTheContent(trigger: JQuery, newMain: JQuery, args: any, referencedScripts: JQuery) {

        let width = $(window).width();

        let oldMain = trigger.closest("main");
        var targetMainName = trigger.attr("target");
        if (targetMainName) {
            oldMain = $("main[name='" + targetMainName + "']");
            if (oldMain.length === 0) console.error("There is no <main> object with the name of '" + targetMainName + "'.");
        }
        else targetMainName = oldMain.attr("name");

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
                if (validNode == false) oldMain = null;
            }
        }

        if (oldMain == undefined || oldMain == null || oldMain.length === 0) oldMain = $("main");

        if (targetMainName) newMain.attr("name", targetMainName);

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

    protected updateUrl(referencedScripts: JQuery, element: JQuery, trigger: JQuery) {
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
        else this.onViewChanged(element, trigger, true);

        let modalTitleAttribute = $(".modal-dialog #page_meta_title").attr("value");
        let pageTitleAttribute = $("#page_meta_title").attr("value");

        if (modalTitleAttribute !== undefined || modalTitleAttribute !== undefined)
            document.title = modalTitleAttribute ?? pageTitleAttribute;

        this.onProcessCompleted();
    }

    protected onProcessCompleted() {
        this.processCompleted.raise({});
    }
}