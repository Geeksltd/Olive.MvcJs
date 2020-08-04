import Config from "olive/config";
import CrossDomainEvent from "olive/components/crossDomainEvent";

import ResponseProcessor from "olive/mvc/responseProcessor";
import AjaxRedirect from "olive/mvc/ajaxRedirect";
import StandardAction from "olive/mvc/standardAction";
import ServerInvoker from "olive/mvc/serverInvoker";
import WindowEx from "olive/mvc/windowEx";

import Form from "olive/components/form";
import Url from "olive/components/url";
import SystemExtensions from "olive/extensions/systemExtensions";
import { ModalHelper } from "olive/components/modal";
import Validate from "olive/components/validate";
import Sorting from "olive/components/sorting";
import Paging from "olive/components/paging";
import MasterDetail from "olive/components/masterDetail";
import Alert from "olive/components/alert";
import Waiting from "olive/components/waiting";
import Grid from "olive/components/grid";

import Select from "olive/plugins/select";
import PasswordStength from "olive/plugins/passwordStength";
import { HtmlEditorFactory } from "olive/plugins/htmlEditor";
import { TimeControlFactory } from "olive/plugins/timeControl";
import { AutoCompleteFactory } from "olive/plugins/autoComplete";
import { GlobalSearchFactory } from "olive/plugins/globalSearch";
import { SliderFactory } from "olive/plugins/slider";
import { DatePickerFactory } from "olive/plugins/datePicker";
import { DateTimePickerFactory } from "olive/plugins/dateTimePicker";
import NumbericUpDown from "olive/plugins/numericUpDown";
import { FileUploadFactory } from "olive/plugins/fileUpload";
import ConfirmBoxFactory from "olive/plugins/confirmBox";
import SubMenu from "olive/plugins/subMenu";
import InstantSearch from "olive/plugins/instantSearch";
import DateDropdown from "olive/plugins/dateDropdown";
import UserHelp from "olive/plugins/userHelp";
import MultiSelect from "olive/plugins/multiSelect";
import CustomCheckbox from "olive/plugins/customCheckbox";
import CustomRadio from "olive/plugins/customRadio";
import { CKEditorFileManagerFactory } from "olive/plugins/ckEditorFileManager";
import { GroupingFactory } from "olive/components/grouping";
import { ServiceContainer } from "olive/di/serviceContainer";
import Services from "olive/di/services";
import { ServiceDescription } from "olive/di/serviceDescription";
import SanityAdapter from "olive/plugins/sanityAdapter";
import TestingContext from "olive/plugins/testingContext";

export default class OlivePage implements IServiceLocator {
    public services: ServiceContainer;

    public modal: ModalHelper;
    public waiting: Waiting;

    constructor() {
        this.services = new ServiceContainer();

        this.configureServices(this.services);

        SystemExtensions.initialize();

        this.modal = this.getService<ModalHelper>(Services.ModalHelper);
        this.waiting = this.getService<Waiting>(Services.Waiting);
        window.testingContext = this.getService<TestingContext>(Services.TestingContext);

        this.initializeServices();

        // ASP.NET needs this config for Request.IsAjaxRequest()
        $.ajaxSetup({
            headers: { "X-Requested-With": "XMLHttpRequest" },
        });

        $(() => {
            // $.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS,
            //      { backdrop: this.DEFAULT_MODAL_BACKDROP });
            // $.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
            this.getService<Alert>(Services.Alert).enableAlert();
            this.getService<Validate>(Services.Validate).configure();
            this.onViewChanged(null, null, true, true);
        });

        // TODO: Find a cleaner way.
        this.fixAlertIssues();
        this.getService<ResponseProcessor>(Services.ResponseProcessor)
            .viewChanged.handle((x) => this.onViewChanged(x.container, x.trigger, x.isNewPage));
        CrossDomainEvent.handle("refresh-page", (x) => this.refresh());
    }

    protected initializeServices() {
        this.modal.initialize();
        this.getService<StandardAction>(Services.StandardAction).initialize();
        this.getService<Validate>(Services.Validate).initialize();
        this.getService<MasterDetail>(Services.MasterDetail).initialize();
    }

    protected configureServices(services: ServiceContainer) {
        const out: IOutParam<ServiceDescription> = {};

        services.tryAddSingleton(Services.ServiceLocator, () => this, out);

        services.tryAddSingleton(Services.ConfirmBoxFactory, () => new ConfirmBoxFactory(), out);

        services.tryAddSingleton(Services.Alert, () => new Alert(), out);

        services.tryAddSingleton(Services.Url, () => new Url(), out);

        services.tryAddSingleton(Services.Grid, () => new Grid(), out);

        services.tryAddSingleton(Services.MultiSelect, () => new MultiSelect(), out);

        services.tryAddSingleton(Services.Select, () => new Select(), out);

        services.tryAddSingleton(Services.ResponseProcessor, () => new ResponseProcessor(), out);

        services.tryAddSingleton(Services.SanityAdapter, () => new SanityAdapter(), out);

        if (services.tryAddSingleton(Services.Waiting, (url: Url) => new Waiting(url), out)) {
            out.value.withDependencies(Services.Url);
        }

        if (services.tryAddSingleton(Services.GlobalSearchFactory,
            (waiting: Waiting) => new GlobalSearchFactory(waiting), out)) {
            out.value.withDependencies(Services.Waiting);
        }

        if (services.tryAddSingleton(Services.CKEditorFileManagerFactory,
            (url: Url) => new CKEditorFileManagerFactory(url), out)) {
            out.value.withDependencies(Services.Url);
        }

        if (services.tryAddSingleton(Services.Sorting,
            (url: Url, serverInvoker: ServerInvoker) => new Sorting(url, serverInvoker), out)) {
            out.value.withDependencies(Services.Url, Services.ServerInvoker);
        }

        if (services.tryAddSingleton(Services.Paging,
            (url: Url, serverInvoker: ServerInvoker) => new Paging(url, serverInvoker), out)) {
            out.value.withDependencies(Services.Url, Services.ServerInvoker);
        }

        if (services.tryAddSingleton(Services.FileUploadFactory,
            (url: Url, serverInvoker: ServerInvoker) => new FileUploadFactory(url, serverInvoker), out)) {
            out.value.withDependencies(Services.Url, Services.ServerInvoker);
        }

        if (services.tryAddSingleton(Services.GroupingFactory,
            (url: Url, ajaxRedirect: AjaxRedirect) => new GroupingFactory(url, ajaxRedirect), out)) {
            out.value.withDependencies(Services.Url, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.ModalHelper,
            (url: Url, ajaxRedirect: AjaxRedirect, responseProcessor: ResponseProcessor) =>
                new ModalHelper(url, ajaxRedirect, responseProcessor), out)
        ) {
            out.value.withDependencies(Services.Url, Services.AjaxRedirect, Services.ResponseProcessor);
        }

        if (services.tryAddSingleton(Services.WindowEx,
            (modalHelper: ModalHelper, ajaxRedirect: AjaxRedirect) => new WindowEx(modalHelper, ajaxRedirect), out)) {
            out.value.withDependencies(Services.ModalHelper, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.AutoCompleteFactory,
            (url: Url, form: Form, serverInvoker: ServerInvoker) =>
                new AutoCompleteFactory(url, form, serverInvoker), out)
        ) {
            out.value.withDependencies(Services.Url, Services.Form, Services.ServerInvoker);
        }

        if (services.tryAddSingleton(Services.SliderFactory, (form: Form) => new SliderFactory(form), out)) {
            out.value.withDependencies(Services.Form);
        }

        if (services.tryAddSingleton(Services.HtmlEditorFactory,
            (modalHelper: ModalHelper) => new HtmlEditorFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.DateTimePickerFactory,
            (modalHelper: ModalHelper) => new DateTimePickerFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.DatePickerFactory,
            (modalHelper: ModalHelper) => new DatePickerFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.TimeControlFactory,
            (modalHelper: ModalHelper) => new TimeControlFactory(modalHelper), out)) {
            out.value.withDependencies(Services.ModalHelper);
        }

        if (services.tryAddSingleton(Services.AjaxRedirect,
            (url: Url, responseProcessor: ResponseProcessor, waiting: Waiting) =>
                new AjaxRedirect(url, responseProcessor, waiting), out)
        ) {
            out.value.withDependencies(Services.Url, Services.ResponseProcessor, Services.Waiting);
        }

        if (services.tryAddSingleton(Services.Form,
            (url: Url, validate: Validate, waiting: Waiting, ajaxRedirect: AjaxRedirect) =>
                new Form(url, validate, waiting, ajaxRedirect), out)) {
            out.value.withDependencies(Services.Url, Services.Validate, Services.Waiting, Services.AjaxRedirect);
        }

        if (services.tryAddSingleton(Services.Validate, (alert: Alert, responseProcessor: ResponseProcessor) =>
            new Validate(alert, responseProcessor), out)
        ) {
            out.value.withDependencies(Services.Alert, Services.ResponseProcessor);
        }

        if (services.tryAddSingleton(Services.MasterDetail,
            (validate: Validate, responseProcessor: ResponseProcessor) =>
                new MasterDetail(validate, responseProcessor), out)
        ) {
            out.value.withDependencies(Services.Validate, Services.ResponseProcessor);
        }

        if (services.tryAddSingleton(Services.TestingContext,
            (ajaxRedirect: AjaxRedirect, modalHelper: ModalHelper, serverInvoker: ServerInvoker) =>
                new TestingContext(ajaxRedirect, modalHelper, serverInvoker), out)
        ) {
            out.value.withDependencies(Services.AjaxRedirect, Services.ModalHelper, Services.ServerInvoker);
        }

        if (services.tryAddSingleton(Services.StandardAction,
            (
                alert: Alert,
                form: Form,
                waiting: Waiting,
                ajaxRedirect: AjaxRedirect,
                responseProcessor: ResponseProcessor,
                select: Select,
                modalHelper: ModalHelper,
                serviceLocator: IServiceLocator,
            ) =>
                new StandardAction(
                    alert,
                    form,
                    waiting,
                    ajaxRedirect,
                    responseProcessor,
                    select,
                    modalHelper,
                    serviceLocator),
            out)
        ) {
            out.value.withDependencies(
                Services.Alert,
                Services.Form,
                Services.Waiting,
                Services.AjaxRedirect,
                Services.ResponseProcessor,
                Services.Select,
                Services.ModalHelper,
                Services.ServiceLocator);
        }

        if (services.tryAddSingleton(Services.ServerInvoker, (
            url: Url,
            validate: Validate,
            waiting: Waiting,
            form: Form,
            responseProcessor: ResponseProcessor) =>
            new ServerInvoker(url, validate, waiting, form, responseProcessor), out)
        ) {
            out.value.withDependencies(
                Services.Url,
                Services.Validate,
                Services.Waiting,
                Services.Form,
                Services.ResponseProcessor);
        }
    }

    private fixAlertIssues() {
        if (!$.fn.tooltip.Constructor) { $.fn.tooltip.Constructor = {}; }
        window.alertify = (window.require("alertify")() as alertify.IAlertifyStatic);
    }

    protected initializeActions = [];
    protected onInit(action) { this.initializeActions.push(action); }

    protected preInitializeActions = [];
    protected onPreInit(action) { this.preInitializeActions.push(action); }

    protected onViewChanged(
        container: JQuery = null,
        trigger: any = null,
        newPage: boolean = false,
        firstTime: boolean = false,
    ) {
        const standardAction = this.getService<StandardAction>(Services.StandardAction);
        standardAction.runStartup(container, trigger, "PreInit");
        try {
            this.initialize();
        } catch (error) {
            alert("initialization failed: " + error);
        }
        standardAction.runStartup(container, trigger, "Init");

        if (newPage) {
            $("[autofocus]:not([data-autofocus=disabled]):first").focus();
            if (Config.REDIRECT_SCROLLS_UP) { $(window).scrollTop(0); }
        }

        if (firstTime) { this.modal.tryOpenFromUrl(); }
    }

    public initialize() {
        this.preInitializeActions.forEach((action) => action());

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
        this.enablecleanUpNumberField(form);
        this.modal.enableEnsureHeight($("[data-toggle=tab]"));
        this.getService<MultiSelect>(Services.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
        this.getService<Select>(Services.Select)
            .enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
        form.enableDefaultButtonKeyPress($("form input, form select"));
        UserHelp.enable($("[data-user-help]"));
        this.getService<ModalHelper>(Services.ModalHelper).enableLink($("[target='$modal'][href]"));
        this.getService<GroupingFactory>(Services.GroupingFactory).enable($(".form-group #GroupBy"));

        $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust",
            (e: any) => $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight));

        // =================== Plug-ins ====================
        InstantSearch.enable($("[name=InstantSearch]"));
        this.getService<AutoCompleteFactory>(Services.AutoCompleteFactory).enable($("input[autocomplete-source]"));
        this.getService<CKEditorFileManagerFactory>(Services.CKEditorFileManagerFactory)
            .enable($(".ckeditor-file-uri"));
        this.getService<GlobalSearchFactory>(Services.GlobalSearchFactory).enable($("input[data-search-source]"));
        this.getService<DatePickerFactory>(Services.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
        this.getService<DateTimePickerFactory>(Services.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
        this.getService<TimeControlFactory>(Services.TimeControlFactory).enable($("[data-control=time-picker]"));
        DateDropdown.enable($("[data-control=date-drop-downs]"));
        this.getService<HtmlEditorFactory>(Services.HtmlEditorFactory).enable($("[data-control=html-editor]"));
        NumbericUpDown.enable($("[data-control=numeric-up-down]"));
        this.getService<SliderFactory>(Services.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
        this.getService<FileUploadFactory>(Services.FileUploadFactory).enable($(".file-upload input:file"));
        this.getService<ConfirmBoxFactory>(Services.ConfirmBoxFactory).enable($("[data-confirm-question]"));
        PasswordStength.enable($(".password-strength"));
        SubMenu.enable($(".with-submenu"));
        SubMenu.createAccordion($("ul.accordion"));
        this.enableCustomCheckbox();
        this.enableCustomRadio();
        this.customizeValidationTooltip();

        // =================== Request lifecycle ====================
        this.getService<WindowEx>(Services.WindowEx).enableBack($(window));
        this.getService<AjaxRedirect>(Services.AjaxRedirect).enableRedirect($("a[data-redirect=ajax]"));
        form.enablesubmitCleanGet($("form[method=get]"));

        const formAction = this.getService<ServerInvoker>(Services.ServerInvoker);
        formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
        formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
        formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
        formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
        formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");

        this.getService<MasterDetail>(Services.MasterDetail).updateSubFormStates();
        this.modal.adjustHeight();

        this.initializeActions.forEach((action) => action());

        $(this).trigger("initialized");

        window.testingContext.onPageInitialized();

        try { $.validator.unobtrusive.parse("form"); } catch (error) { console.error(error); }
    }

    protected enableCustomCheckbox() {
        const all = $("input[type=checkbox]");
        const shouldSkip = $(".as-buttons-input input[type=checkbox]");

        CustomCheckbox.enable(all.not(shouldSkip));
    }

    protected enablecleanUpNumberField(form: Form) {
        form.enablecleanUpNumberField($("[data-val-number]"));
    }

    protected enableCustomRadio() {
        const all = $("input[type=radio]");
        const shouldSkip = $(".as-buttons-input input[type=radio]");

        CustomRadio.enable(all.not(shouldSkip));
    }

    protected goBack(target) {
        const url = this.getService<Url>(Services.Url);

        const returnUrl = url.getQuery("ReturnUrl");

        if (returnUrl && target && $(target).is("[data-redirect=ajax]")) {
            this.getService<AjaxRedirect>(Services.AjaxRedirect).go(returnUrl, $(target), false, false, true);
        } else { url.goBack(); }

        return false;
    }

    protected customizeValidationTooltip() { /** */ }

    protected refresh(keepScroll = false) {
        if ($("main").length === 1 || $("main").length === 2) {
            // if there is an ajax modal available, then we have 2 main elements.
            this.getService<AjaxRedirect>(Services.AjaxRedirect)
                .go(location.href, null, false /*isBack*/, keepScroll, false);
        } else {
            location.reload();
        }

        return false;
    }

    public getService<T extends IService>(key: string) {
        return this.services.getService<T>(key);
    }
}
