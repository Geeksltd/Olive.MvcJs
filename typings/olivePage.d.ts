import { ModalHelper } from 'olive/components/modal';
import Waiting from 'olive/components/waiting';
import { ServiceContainer } from "./di/serviceContainer";
export default class OlivePage {
    private services;
    modalHelper: ModalHelper;
    waiting: typeof Waiting;
    constructor();
    configureServices(services: ServiceContainer): void;
    fixAlertIssues(): void;
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    onViewChanged(container?: JQuery, trigger?: any, newPage?: boolean, firstTime?: boolean): void;
    initialize(): void;
    enableCustomCheckbox(): void;
    enableCustomRadio(): void;
    goBack(target: any): boolean;
    customizeValidationTooltip(): void;
    refresh(keepScroll?: boolean): boolean;
    private getService;
}
