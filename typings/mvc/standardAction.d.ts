import Alert from 'olive/components/alert';
import Select from 'olive/plugins/select';
import Waiting from 'olive/components/waiting';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';
import Form from 'olive/components/form';
import FormAction from './formAction';
export default class StandardAction implements IService {
    private alert;
    private form;
    private formAction;
    private waiting;
    private ajaxRedirect;
    private select;
    constructor(alert: Alert, form: Form, formAction: FormAction, waiting: Waiting, ajaxRedirect: AjaxRedirect, select: Select);
    enableLinkModal(selector: JQuery): void;
    runStartup(container?: JQuery, trigger?: any, stage?: string): void;
    runAll(actions: any, trigger?: any): void;
    run(action: any, trigger: any): boolean;
    notify(action: any, trigger: any): void;
    redirect(action: any, trigger: any): void;
    openModal(event: any, url?: any, options?: any): any;
    openModaliFrame(event: any, url?: any, options?: any): void;
}
