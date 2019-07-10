import Waiting from 'olive/components/waiting';
import Validate from 'olive/components/validate';
import MasterDetail from 'olive/components/masterDetail';
import Form from 'olive/components/form';
import Url from 'olive/components/url';
import StandardAction from 'olive/mvc/standardAction';
import LiteEvent from 'olive/components/liteEvent';
export interface IViewUpdatedEventArgs {
    container: JQuery;
    trigger: any;
    isNewPage: boolean;
}
export default class FormAction implements IService {
    private url;
    private validate;
    private masterDetail;
    private standardAction;
    private form;
    private waiting;
    isAwaitingAjaxResponse: boolean;
    events: {
        [event: string]: Function[];
    };
    dynamicallyLoadedScriptFiles: any[];
    onViewChanged: LiteEvent<IViewUpdatedEventArgs>;
    constructor(url: Url, validate: Validate, masterDetail: MasterDetail, standardAction: StandardAction, form: Form, waiting: Waiting);
    enableInvokeWithAjax(selector: JQuery, event: string, attrName: string): void;
    enableinvokeWithPost(selector: JQuery): void;
    invokeWithPost(event: any): boolean;
    invokeWithAjax(event: any, actionUrl: any, syncCall?: boolean): boolean;
    onAjaxResponseError(jqXHR: JQueryXHR, status: string, error: string): void;
    processAjaxResponse(response: any, containerModule: any, trigger: any, args: any): void;
    raiseViewChanged(container: any, trigger: any, isNewPage?: boolean): void;
    navigate(element: JQuery, trigger: any, args: any): void;
    private processWithTheContent;
    private updateUrl;
}
