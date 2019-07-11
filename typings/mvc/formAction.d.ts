import Waiting from 'olive/components/waiting';
import Validate from 'olive/components/validate';
import MasterDetail from 'olive/components/masterDetail';
import Form from 'olive/components/form';
import Url from 'olive/components/url';
import StandardAction from 'olive/mvc/standardAction';
import LiteEvent from 'olive/components/liteEvent';
import { ModalHelper } from '../components/modal';
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
    private modalHelper;
    isAwaitingAjaxResponse: boolean;
    events: {
        [event: string]: Function[];
    };
    private dynamicallyLoadedScriptFiles;
    onViewChanged: LiteEvent<IViewUpdatedEventArgs>;
    constructor(url: Url, validate: Validate, masterDetail: MasterDetail, standardAction: StandardAction, form: Form, waiting: Waiting, modalHelper: ModalHelper);
    enableInvokeWithAjax(selector: JQuery, event: string, attrName: string): void;
    enableinvokeWithPost(selector: JQuery): void;
    private invokeWithPost;
    invokeWithAjax(event: any, actionUrl: any, syncCall?: boolean): boolean;
    onAjaxResponseError(jqXHR: JQueryXHR, status: string, error: string): void;
    processAjaxResponse(response: any, containerModule: any, trigger: any, args: any): void;
    private raiseViewChanged;
    private navigate;
    private processWithTheContent;
    private updateUrl;
}
