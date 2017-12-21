import Modal from 'olive/Components/Modal';
export default class OlivePage {
    modal(): typeof Modal;
    constructor();
    _initializeActions: any[];
    onInit(action: any): void;
    _preInitializeActions: any[];
    onPreInit(action: any): void;
    onViewChanged(container?: JQuery, trigger?: any, newPage?: boolean): void;
    initialize(): void;
    goBack(target: any): boolean;
}
