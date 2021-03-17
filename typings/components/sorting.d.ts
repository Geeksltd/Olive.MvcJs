import "jquery-sortable";
import ServerInvoker from "olive/mvc/serverInvoker";
import Url from "olive/components/url";
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
