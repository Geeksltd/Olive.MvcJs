import Url from 'olive/components/url';
import 'jquery-sortable';
import ServerInvoker from 'olive/mvc/serverInvoker';
import { DelayedInitializer } from 'olive/plugins/delayedInitializer';
export default class Sorting implements IService {
    private url;
    private serverInvoker;
    private delayedInitializer;
    constructor(url: Url, serverInvoker: ServerInvoker, delayedInitializer: DelayedInitializer);
    enableDragSort(selector: JQuery): void;
    enablesetSortHeaderClass(selector: JQuery): void;
    enableAjaxSorting(selector: JQuery): void;
    private AjaxSorting;
    setSortHeaderClass(thead: JQuery): void;
    private DragSort;
}
