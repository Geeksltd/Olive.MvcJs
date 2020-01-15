import LiteEvent from "olive/components/liteEvent";

export default class ResponseProcessor implements IService {
    private dynamicallyLoadedScriptFiles = [];

    public subformChanged = new LiteEvent<IResponseProcessorEventArgs>();
    public viewChanged = new LiteEvent<IViewUpdatedEventArgs>();
    public processCompleted = new LiteEvent<IEventArgs>();
    public nothingFoundToProcess = new LiteEvent<IResponseProcessorEventArgs>();

    public processAjaxResponse(response: any, containerModule: JQuery, trigger: JQuery, args: any) {

        let asElement = $(response);

        if (asElement.is("main")) {
            this.navigate(asElement, trigger, args);
            return;
        }

        if (asElement.is("[data-module]")) {
            containerModule.replaceWith(asElement);
            this.onViewChanged(asElement, trigger);
            return;
        }

        if (response.length == 1 && response[0].ReplaceView) {
            asElement = $("<div/>").append(response[0].ReplaceView);
            containerModule.replaceWith(asElement);
            this.onViewChanged(asElement, trigger);
            return;
        }

        if (trigger && trigger.is("[data-add-subform]")) {
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

        let referencedScripts = element.find("script[src]").map((i, s) => $(s).attr("src"));
        let referencedCss = element.find("link[rel='stylesheet']").map((i, s) => $(s).attr("href"));
        element.find("script[src]").remove();
        element.find("link[rel='stylesheet']").remove();

        //check for CSS links in the main tag after ajax call
        if (referencedCss.length > 0) {
            
            let currentCss = $("head").find("link[rel='stylesheet']").map((i, s) => $(s).attr("href"));

            let cssTobeAdded = this.addSelectedCss(currentCss, referencedCss);

            this.loadCssFiles(cssTobeAdded, trigger, element, args, referencedScripts);
        }
        else
            this.processWithTheContent(trigger, element, args, referencedScripts);
    }

    private loadCssFiles(cssArray: any[], trigger, element, args, referencedScripts) {
        
        if (cssArray.length > 0) {
            $("head").append($('<link rel="stylesheet" type="text/css" />').attr("href", cssArray[0]));
            cssArray.pop();
            this.loadCssFiles(cssArray, trigger, element, args, referencedScripts);
        }
        else
            return this.processWithTheContent(trigger, element, args, referencedScripts);
    }

    private addSelectedCss(currentCssArray: any, newCssArray: any) {

        let uniqueArray = [];

        // Loop through array values
        for (let newCss of newCssArray) {

            let shouldBeAdded: boolean = false;

            currentCssArray.each((i, item) => {

                if (item == newCss) {
                    shouldBeAdded = false;
                    return false;
                }
                else
                    shouldBeAdded = true;
            });

            if (shouldBeAdded) 
                    uniqueArray.push(newCss);
        }
        
        return uniqueArray;
    }

    protected processWithTheContent(trigger: JQuery, element: JQuery, args: any, referencedScripts: JQuery) {

        let width = $(window).width();

        let oldMain = trigger.closest("main");
        if (oldMain.length === 0) oldMain = $("main");

        let tooltips = $('body > .tooltip');

        tooltips.each((index, elem) => {
            if ($('[aria-discribedby=' + elem.id + ']'))
                elem.remove();
        });

        if (width <= 800 && trigger.data("transition") == "slide") {
            let newMain = element.appendTo(oldMain.parent());
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
                this.updateUrl(referencedScripts, element, trigger);
            }, 400);
        }
        else {
            oldMain.replaceWith(element);
            this.updateUrl(referencedScripts, element, trigger);
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

        document.title = $("#page_meta_title").val();

        this.onProcessCompleted();
    }

    protected onProcessCompleted() {
        this.processCompleted.raise({});
    }
}