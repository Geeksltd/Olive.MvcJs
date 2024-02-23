import Url from "olive/components/url";
import "jquery-sortable";
import "jquery-ui-touch-punch";
import ServerInvoker from "olive/mvc/serverInvoker";
export default class Sorting implements IService {
    private url;
    private serverInvoker;
    constructor(url: Url, serverInvoker: ServerInvoker);
    enableDragSort(selector: JQuery): void;
    enablesetSortHeaderClass(selector: JQuery): void;
    enableAjaxSorting(selector: JQuery): void;
    private AjaxSorting;
    setSortHeaderClass(thead: JQuery): void;
    private DragSort;
}
