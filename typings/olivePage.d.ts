import Modal from 'olive/components/modal';
import Waiting from 'olive/components/waiting';
export default class OlivePage {
    modal: typeof Modal;
    waiting: typeof Waiting;
    constructor();
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
}
