import Form from "olive/components/form";
import { ModalHelper } from "olive/components/modal";
import Waiting from "olive/components/waiting";
import { ServiceContainer } from "olive/di/serviceContainer";
export default class OlivePage implements IServiceLocator {
    services: ServiceContainer;
    modal: ModalHelper;
    waiting: Waiting;
    constructor();
    protected initializeServices(): void;
    protected configureServices(services: ServiceContainer): void;
    private fixAlertIssues;
    protected initializeActions: any[];
    protected onInit(action: any): void;
    protected preInitializeActions: any[];
    protected onPreInit(action: any): void;
    protected onViewChanged(container?: JQuery, trigger?: any, newPage?: boolean, firstTime?: boolean): void;
    initialize(): void;
    protected enableCustomCheckbox(): void;
    protected enablecleanUpNumberField(form: Form): void;
    protected enableCustomRadio(): void;
    protected goBack(target: any): boolean;
    protected customizeValidationTooltip(): void;
    protected refresh(keepScroll?: boolean): boolean;
    getService<T extends IService>(key: string): T;
}
