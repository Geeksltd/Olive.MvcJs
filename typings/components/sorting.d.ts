import Url from 'olive/components/url';
import FormAction from 'olive/mvc/formAction';
import 'jquery-sortable';
export default class Sorting implements IService {
    private url;
    private formAction;
    constructor(url: Url, formAction: FormAction);
    enableDragSort(selector: JQuery): void;
    enablesetSortHeaderClass(selector: JQuery): void;
    enableAjaxSorting(selector: JQuery): void;
    private AjaxSorting;
    setSortHeaderClass(thead: JQuery): void;
    private DragSort;
}
