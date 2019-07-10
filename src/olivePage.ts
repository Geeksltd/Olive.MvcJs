
import Config from "olive/config"
import CrossDomainEvent from 'olive/components/crossDomainEvent'

import FormAction from 'olive/mvc/formAction'
import AjaxRedirect from 'olive/mvc/ajaxRedirect'
import StandardAction from 'olive/mvc/standardAction'

import Form from 'olive/components/form'
import Url from 'olive/components/url'
import SystemExtensions from 'olive/extensions/systemExtensions'
import { ModalHelper } from 'olive/components/modal'
import Validate from 'olive/components/validate'
import Sorting from 'olive/components/sorting'
import Paging from 'olive/components/paging'
import MasterDetail from 'olive/components/masterDetail'
import Alert from 'olive/components/alert'
import Waiting from 'olive/components/waiting'
import Grid from 'olive/components/grid'

import Select from 'olive/plugins/select'
import PasswordStength from 'olive/plugins/passwordStength'
import { HtmlEditorFactory } from 'olive/plugins/htmlEditor'
import { TimeControlFactory } from 'olive/plugins/timeControl'
import { AutoCompleteFactory } from 'olive/plugins/autoComplete'
import GlobalSearch from 'olive/plugins/globalSearch'
import { SliderFactory } from 'olive/plugins/slider'
import { DatePickerFactory } from 'olive/plugins/datePicker'
import { DateTimePickerFactory } from 'olive/plugins/dateTimePicker'
import NumbericUpDown from 'olive/plugins/numericUpDown'
import { FileUploadFactory } from 'olive/plugins/fileUpload'
import ConfirmBox from 'olive/plugins/confirmBox'
import SubMenu from 'olive/plugins/subMenu'
import InstantSearch from 'olive/plugins/instantSearch'
import DateDropdown from 'olive/plugins/dateDropdown'
import UserHelp from 'olive/plugins/userHelp'
import MultiSelect from "./plugins/multiSelect";
import CustomCheckbox from "./plugins/customCheckbox";
import CustomRadio from "./plugins/customRadio";
import { CKEditorFileManagerFactory } from "./plugins/ckEditorFileManager";
import { GroupingFactory } from "./components/grouping";
import { ServiceContainer } from "./di/serviceContainer";
import Services from "./di/services";
import { ServiceDescription } from "./di/serviceDescription";

export default class OlivePage {

    private services: ServiceContainer;

    public modalHelper: ModalHelper;
    public waiting = Waiting;

    constructor() {
        this.services = new ServiceContainer();

        this.configureServices(this.services);

        SystemExtensions.initialize();

        this.modalHelper = this.getService<ModalHelper>(Services.ModalHelper);
        this.modalHelper.initialize();

        //ASP.NET needs this config for Request.IsAjaxRequest()
        $.ajaxSetup({
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        $(() => {
            //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
            //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
            this.getService<Alert>(Services.Alert).enableAlert();
            this.getService<Validate>(Services.Validate).configure();
            this.onViewChanged(null, null, true, true);
        });

        // TODO: Find a cleaner way.
        this.fixAlertIssues();
        this.getService<FormAction>(Services.FormAction).onViewChanged.handle(x => this.onViewChanged(x.container, x.trigger, x.isNewPage));
        CrossDomainEvent.handle('refresh-page', x => this.refresh());
    }

    configureServices(services: ServiceContainer) {
        const out: IOutParam<ServiceDescription> = {};

        services.tryAddSingleton(Services.Alert, () => new Alert(), out);

        services.tryAddSingleton(Services.Url, () => new Url(), out);

        services.tryAddSingleton(Services.Grid, () => new Grid(), out);

        services.tryAddSingleton(Services.MultiSelect, () => new MultiSelect(), out);

        services.tryAddSingleton(Services.Select, () => new Select(), out);

        if (services.tryAddSingleton(Services.Waiting, (url: Url) => new Waiting(url), out)) {
            out.value.withDependencies(Services.Url);
        }

        if (services.tryAddSingleton(Services.CKEditorFileManagerFactory, (url: Url) => new CKEditorFileManagerFactory(url), out)) {
            out.value.withDependencies(Services.Url);
        }

        if (services.tryAddSingleton(Services.Sorting, (url: Url, formAction: FormAction) => new Sorting(url, formAction), out)) {
            out.value.withDependencies(Services.Url, Services.FormAction);
        }

        if (services.tryAddSingleton(Services.Paging, (url: Url, formAction: FormAction) => new Paging(url, formAction), out)) {
            out.value.withDependencies(Services.Url, Services.FormAction);
        }

        if (services.tryAddSingleton(Services.FileUploadFactory, (url: Url, formAction: FormAction) => new FileUploadFactory(url, formAction), out)) {
            out.value.withDependencies(Services.Url, Services.FormAction);
        }

        if (services.tryAddSingleton(Services.GroupingFactory, (url: Url, ajaxRedirect: AjaxRedirect) => new GroupingFactory(url, ajaxRedirect), out)) {
            out.value.withDependencies(Services.Url, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.ModalHelper, (url: Url, ajaxRedirect: AjaxRedirect) => new ModalHelper(url, ajaxRedirect), out)) {
            out.value.withDependencies(Services.Url, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.AutoCompleteFactory, (url: Url, form: Form, formAction: FormAction) => new AutoCompleteFactory(url, form, formAction), out)) {
            out.value.withDependencies(Services.Url, Services.Form, Services.FormAction);
        }

        if (services.tryAddSingleton(Services.SliderFactory, (form: Form) => new SliderFactory(form), out)) {
            out.value.withDependencies(Services.Form);
        }

        if (services.tryAddSingleton(Services.DateTimePickerFactory, (modalHelper: ModalHelper) => new DateTimePickerFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.DatePickerFactory, (modalHelper: ModalHelper) => new DatePickerFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.TimeControlFactory, (modalHelper: ModalHelper) => new TimeControlFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.AjaxRedirect, (url: Url, formAction: FormAction, waiting: Waiting, modalHelper: ModalHelper) =>
            new AjaxRedirect(url, formAction, waiting, modalHelper), out)) {
            out.value.withDependencies(Services.Url, Services.FormAction, Services.Waiting, Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.Form, (url: Url, validate: Validate, waiting: Waiting, ajaxRedirect: AjaxRedirect) =>
            new Form(url, validate, waiting, ajaxRedirect), out)) {
            out.value.withDependencies(Services.Url, Services.Validate, Services.Waiting, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.Validate, (alert: Alert) => new Validate(alert), out)) {
            out.value.withDependencies(Services.Alert);
        }

        if (services.tryAddSingleton(Services.MasterDetail, (validate: Validate) => new MasterDetail(validate), out)) {
            out.value.withDependencies(Services.Validate);
        }

        if (services.tryAddSingleton(Services.StandardAction, (alert: Alert,
            form: Form,
            formAction: FormAction,
            waiting: Waiting,
            ajaxRedirect: AjaxRedirect,
            select: Select,
            modalHelper: ModalHelper) =>
            new StandardAction(alert, form, formAction, waiting, ajaxRedirect, select, modalHelper), out)
        ) {
            out.value.withDependencies(
                Services.Alert,
                Services.Form,
                Services.FormAction,
                Services.Waiting,
                Services.AjaxRedirect,
                Services.Select,
                Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.FormAction, (url: Url,
            validate: Validate,
            masterDetail: MasterDetail,
            standardAction: StandardAction,
            form: Form,
            waiting: Waiting,
            modalHelper: ModalHelper) =>
            new FormAction(url, validate, masterDetail, standardAction, form, waiting, modalHelper), out)
        ) {
            out.value.withDependencies(
                Services.Url,
                Services.Validate,
                Services.MasterDetail,
                Services.StandardAction,
                Services.Form,
                Services.Waiting,
                Services.ModalHelper);
        }
    }

    fixAlertIssues() {
        if (!$.fn.tooltip.Constructor) $.fn.tooltip.Constructor = {};
        window["alertify"] = <alertify.IAlertifyStatic>window.require("alertify")();
    }

    _initializeActions = [];
    onInit(action) { this._initializeActions.push(action) }

    _preInitializeActions = [];
    onPreInit(action) { this._preInitializeActions.push(action) }

    onViewChanged(container: JQuery = null, trigger: any = null, newPage: boolean = false, firstTime: boolean = false) {
        const standardAction = this.getService<StandardAction>(Services.StandardAction);
        standardAction.runStartup(container, trigger, "PreInit");
        try {
            this.initialize();
        } catch (error) {
            alert("initialization failed: " + error);
        }
        standardAction.runStartup(container, trigger, "Init");

        if (newPage) {
            $('[autofocus]:not([data-autofocus=disabled]):first').focus();
            if (Config.REDIRECT_SCROLLS_UP) $(window).scrollTop(0);
        }

        //if (firstTime) Modal.tryOpenFromUrl();
    }

    initialize() {
        this._preInitializeActions.forEach((action) => action());

        // =================== Standard Features ====================
        const grid = this.getService<Grid>(Services.Grid);
        grid.mergeActionButtons();
        grid.enableColumn($(".select-cols .apply"));
        grid.enableSelectCol($(".select-grid-cols .group-control"));
        grid.enableToggle($("th.select-all > input:checkbox"));
        this.getService<MasterDetail>(Services.MasterDetail).enable($("[data-delete-subform]"));
        const paging = this.getService<Paging>(Services.Paging);
        paging.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
        const sorting = this.getService<Sorting>(Services.Sorting);
        sorting.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
        paging.enableWithAjax($("a[data-pagination]"));
        sorting.enableAjaxSorting($("a[data-sort]"));
        sorting.setSortHeaderClass($("th[data-sort]"));
        const form = this.getService<Form>(Services.Form);
        form.enablecleanUpNumberField($("[data-val-number]"));
        this.modalHelper.enableEnsureHeight($("[data-toggle=tab]"));
        this.getService<MultiSelect>(Services.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
        this.getService<Select>(Services.Select).enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
        form.enableDefaultButtonKeyPress($("form input, form select"));
        UserHelp.enable($("[data-user-help]"));
        this.getService<StandardAction>(Services.StandardAction).enableLinkModal($("[target='$modal'][href]"));
        this.getService<GroupingFactory>(Services.GroupingFactory).enable($(".form-group #GroupBy"));

        $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust",
            (e: any) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));

        // =================== Plug-ins ====================
        InstantSearch.enable($("[name=InstantSearch]"));
        this.getService<AutoCompleteFactory>(Services.AutoCompleteFactory).enable($("input[autocomplete-source]"));
        this.getService<CKEditorFileManagerFactory>(Services.CKEditorFileManagerFactory).enable($(".ckeditor-file-uri"));
        GlobalSearch.enable($("input[data-search-source]"));
        this.getService<DatePickerFactory>(Services.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
        this.getService<DateTimePickerFactory>(Services.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
        this.getService<TimeControlFactory>(Services.TimeControlFactory).enable($("[data-control=time-picker]"));
        DateDropdown.enable($("[data-control=date-drop-downs]"));
        this.getService<HtmlEditorFactory>(Services.HtmlEditorFactory).enable($("[data-control=html-editor]"));
        NumbericUpDown.enable($("[data-control=numeric-up-down]"));
        this.getService<SliderFactory>(Services.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
        this.getService<FileUploadFactory>(Services.FileUploadFactory).enable($(".file-upload input:file"));
        ConfirmBox.enable($("[data-confirm-question]"));
        PasswordStength.enable($(".password-strength"));
        SubMenu.enable($(".with-submenu"));
        SubMenu.createAccordion($("ul.accordion"));
        this.enableCustomCheckbox();
        this.enableCustomRadio();
        this.customizeValidationTooltip();

        // =================== Request lifecycle ====================
        const ajaxRedirect = this.getService<AjaxRedirect>(Services.AjaxRedirect);
        ajaxRedirect.enableBack($(window));
        ajaxRedirect.enableRedirect($("a[data-redirect=ajax]"));
        form.enablesubmitCleanGet($('form[method=get]'));

        const formAction = this.getService<FormAction>(Services.FormAction);
        formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
        formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
        formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
        formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
        formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");

        this.getService<MasterDetail>(Services.MasterDetail).updateSubFormStates();
        this.modalHelper.adjustHeight();

        this._initializeActions.forEach((action) => action());

        window["IsOliveMvcLoaded"] = true;

        try { $.validator.unobtrusive.parse('form'); }
        catch (error) { console.error(error); }
    }

    enableCustomCheckbox() {
        CustomCheckbox.enable($("input[type=checkbox]"));
    }

    enableCustomRadio() {
        CustomRadio.enable($("input[type=radio]"));
    }

    goBack(target) {
        const url = this.getService<Url>(Services.Url);

        let returnUrl = url.getQuery("ReturnUrl");

        if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
            this.getService<AjaxRedirect>(Services.AjaxRedirect).go(returnUrl, $(target), false, false, true);
        else url.goBack();

        return false;
    }

    customizeValidationTooltip() {

    }

    refresh(keepScroll = false) {
        if ($("main").length == 1 || $("main").length === 2) //if there is an ajax modal available, then we have 2 main elements.
            this.getService<AjaxRedirect>(Services.AjaxRedirect).go(location.href, null, false /*isBack*/, keepScroll, false);
        else location.reload();

        return false;
    }

    private getService<T extends IService>(key: string) {
        return this.services.getService<T>(key);
    }
}