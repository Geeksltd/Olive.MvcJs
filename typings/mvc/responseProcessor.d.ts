import LiteEvent from "olive/components/liteEvent";
export default class ResponseProcessor implements IService {
    private dynamicallyLoadedScriptFiles;
    subformChanged: LiteEvent<IResponseProcessorEventArgs>;
    viewChanged: LiteEvent<IViewUpdatedEventArgs>;
    processCompleted: LiteEvent<IEventArgs>;
    nothingFoundToProcess: LiteEvent<IResponseProcessorEventArgs>;
    processAjaxResponse(response: any, containerModule: JQuery, trigger: JQuery, args: any, ajaxTarget?: string, ajaxhref?: string): void;
    protected onNothingFoundToProcess(response: any, trigger: JQuery): void;
    protected onSubformChanged(response: any, trigger: JQuery): void;
    protected onViewChanged(container: JQuery, trigger: JQuery, isNewPage?: boolean): void;
    protected navigate(element: JQuery, trigger: JQuery, args: any): void;
    protected navigatebyAjaxTarget(element: JQuery, ajaxTarget: string): void;
    private getNewCss;
    private getCss;
    protected processWithTheContent(trigger: JQuery, newMain: JQuery, args: any, referencedScripts: JQuery): void;
    private processWithTheContentInternal;
    private replaceContent;
    protected updateUrl(referencedScripts: JQuery, element: JQuery, trigger: JQuery): void;
    protected onProcessCompleted(): void;
}
