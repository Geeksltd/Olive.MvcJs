import Modal from 'olive/components/modal';
import Waiting from 'olive/components/waiting';
export default class OlivePage {
    modal: typeof Modal;
    waiting: typeof Waiting;
    constructor();
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    onViewChanged(container?: JQuery, trigger?: any, newPage?: boolean): void;
    initialize(): void;
    goBack(target: any): boolean;
    refresh(keepScroll?: boolean): boolean;
}
