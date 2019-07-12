import Url from 'olive/components/url';
import 'jquery-sortable';
import CombinedUtilities from 'olive/mvc/combinedUtilities';
export default class Sorting implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: CombinedUtilities);
    enableDragSort(selector: JQuery): void;
    enablesetSortHeaderClass(selector: JQuery): void;
    enableAjaxSorting(selector: JQuery): void;
    private AjaxSorting;
    setSortHeaderClass(thead: JQuery): void;
    private DragSort;
}
