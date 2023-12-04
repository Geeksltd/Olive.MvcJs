import Alert from 'olive/components/alert';
import Select from 'olive/plugins/select';
import Waiting from 'olive/components/waiting';
import { ModalHelper } from '../components/modal';
import AjaxRedirect from 'olive/mvc/ajaxRedirect';
import Form from 'olive/components/form';
import ResponseProcessor from 'olive/mvc/responseProcessor';
export default class StandardAction implements IService {
    private alert;
    private form;
    private waiting;
    private ajaxRedirect;
    private responseProcessor;
    private select;
    private modalHelper;
    private serviceLocator;
    constructor(alert: Alert, form: Form, waiting: Waiting, ajaxRedirect: AjaxRedirect, responseProcessor: ResponseProcessor, select: Select, modalHelper: ModalHelper, serviceLocator: IServiceLocator);
    initialize(): void;
    runStartup(container?: JQuery, trigger?: any, stage?: string): void;
    runAll(actions: any, trigger?: any): void;
    private run;
    private notify;
    protected redirect(action: any, trigger: any): void;
    private openModal;
    private loadServiceAfterConfiguration;
    private loadService;
}
