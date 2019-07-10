export default class Grid implements IService {
    enableColumn(element: any): void;
    enableToggle(element: any): void;
    enableHlightRow(element: any): void;
    enableSelectCol(selector: JQuery): void;
    applyColumns(event: JQueryEventObject): void;
    enableSelectColumns(container: any): void;
    enableSelectAllToggle(event: any): void;
    highlightRow(element: any): void;
    mergeActionButtons(): void;
}
