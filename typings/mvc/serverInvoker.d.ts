import Url from "olive/components/url";
import Waiting from "olive/components/waiting";
import Form from "olive/components/form";
import Validate from "olive/components/validate";
import ResponseProcessor from "./responseProcessor";
export default class ServerInvoker implements IService {
    private url;
    private validate;
    private waiting;
    private form;
    private responseProcessor;
    isAwaitingAjaxResponse: boolean;
    constructor(url: Url, validate: Validate, waiting: Waiting, form: Form, responseProcessor: ResponseProcessor);
    enableInvokeWithAjax(selector: JQuery, event: string, attrName: string): void;
    enableinvokeWithPost(selector: JQuery): void;
    private invokeWithPost;
    invokeWithAjax(event: JQueryEventObject, actionUrl: string, syncCall?: boolean): boolean;
    onAjaxResponseError(jqXHR: JQueryXHR, status: string, error: string): void;
}
