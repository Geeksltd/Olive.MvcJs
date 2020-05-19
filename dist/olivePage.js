define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/responseProcessor", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/mvc/serverInvoker", "olive/mvc/windowEx", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "olive/plugins/multiSelect", "olive/plugins/customCheckbox", "olive/plugins/customRadio", "olive/plugins/ckEditorFileManager", "olive/components/grouping", "olive/di/serviceContainer", "olive/di/services", "olive/plugins/sanityAdapter", "olive/plugins/testingContext"], function (require, exports, config_1, crossDomainEvent_1, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1, sanityAdapter_1, testingContext_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.initializeActions = [];
            this.preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            this.modal = this.getService(services_1.default.ModalHelper);
            this.waiting = this.getService(services_1.default.Waiting);
            window.testingContext = this.getService(services_1.default.TestingContext);
            this.initializeServices();
            // ASP.NET needs this config for Request.IsAjaxRequest()
            $.ajaxSetup({
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });
            $(function () {
                // $.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS,
                //      { backdrop: this.DEFAULT_MODAL_BACKDROP });
                // $.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                _this.getService(services_1.default.Alert).enableAlert();
                _this.getService(services_1.default.Validate).configure();
                _this.onViewChanged(null, null, true, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            this.getService(services_1.default.ResponseProcessor)
                .viewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_1.default.handle("refresh-page", function (x) { return _this.refresh(); });
        }
        OlivePage.prototype.initializeServices = function () {
            this.modal.initialize();
            this.getService(services_1.default.StandardAction).initialize();
            this.getService(services_1.default.Validate).initialize();
            this.getService(services_1.default.MasterDetail).initialize();
        };
        OlivePage.prototype.configureServices = function (services) {
            var _this = this;
            var out = {};
            services.tryAddSingleton(services_1.default.ServiceLocator, function () { return _this; }, out);
            services.tryAddSingleton(services_1.default.ConfirmBoxFactory, function () { return new confirmBox_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Alert, function () { return new alert_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Url, function () { return new url_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Grid, function () { return new grid_1.default(); }, out);
            services.tryAddSingleton(services_1.default.MultiSelect, function () { return new multiSelect_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Select, function () { return new select_1.default(); }, out);
            services.tryAddSingleton(services_1.default.ResponseProcessor, function () { return new responseProcessor_1.default(); }, out);
            services.tryAddSingleton(services_1.default.SanityAdapter, function () { return new sanityAdapter_1.default(); }, out);
            if (services.tryAddSingleton(services_1.default.Waiting, function (url) { return new waiting_1.default(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.GlobalSearchFactory, function (waiting) { return new globalSearch_1.GlobalSearchFactory(waiting); }, out)) {
                out.value.withDependencies(services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.CKEditorFileManagerFactory, function (url) { return new ckEditorFileManager_1.CKEditorFileManagerFactory(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.Sorting, function (url, serverInvoker) { return new sorting_1.default(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.Paging, function (url, serverInvoker) { return new paging_1.default(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.FileUploadFactory, function (url, serverInvoker) { return new fileUpload_1.FileUploadFactory(url, serverInvoker); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.GroupingFactory, function (url, ajaxRedirect) { return new grouping_1.GroupingFactory(url, ajaxRedirect); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.ModalHelper, function (url, ajaxRedirect, responseProcessor) {
                return new modal_1.ModalHelper(url, ajaxRedirect, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.WindowEx, function (modalHelper, ajaxRedirect) { return new windowEx_1.default(modalHelper, ajaxRedirect); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.AutoCompleteFactory, function (url, form, serverInvoker) {
                return new autoComplete_1.AutoCompleteFactory(url, form, serverInvoker);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Form, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.SliderFactory, function (form) { return new slider_1.SliderFactory(form); }, out)) {
                out.value.withDependencies(services_1.default.Form);
            }
            if (services.tryAddSingleton(services_1.default.HtmlEditorFactory, function (modalHelper) { return new htmlEditor_1.HtmlEditorFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DateTimePickerFactory, function (modalHelper) { return new dateTimePicker_1.DateTimePickerFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.DatePickerFactory, function (modalHelper) { return new datePicker_1.DatePickerFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.TimeControlFactory, function (modalHelper) { return new timeControl_1.TimeControlFactory(modalHelper); }, out)) {
                out.value.withDependencies(services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.AjaxRedirect, function (url, responseProcessor, waiting) {
                return new ajaxRedirect_1.default(url, responseProcessor, waiting);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.ResponseProcessor, services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.Form, function (url, validate, waiting, ajaxRedirect) {
                return new form_1.default(url, validate, waiting, ajaxRedirect);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.Validate, function (alert, responseProcessor) {
                return new validate_1.default(alert, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.MasterDetail, function (validate, responseProcessor) {
                return new masterDetail_1.default(validate, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Validate, services_1.default.ResponseProcessor);
            }
            if (services.tryAddSingleton(services_1.default.TestingContext, function (ajaxRedirect, modalHelper, serverInvoker) {
                return new testingContext_1.default(ajaxRedirect, modalHelper, serverInvoker);
            }, out)) {
                out.value.withDependencies(services_1.default.AjaxRedirect, services_1.default.ModalHelper, services_1.default.ServerInvoker);
            }
            if (services.tryAddSingleton(services_1.default.StandardAction, function (alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, serviceLocator) {
                return new standardAction_1.default(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper, serviceLocator);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.Form, services_1.default.Waiting, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor, services_1.default.Select, services_1.default.ModalHelper, services_1.default.ServiceLocator);
            }
            if (services.tryAddSingleton(services_1.default.ServerInvoker, function (url, validate, waiting, form, responseProcessor) {
                return new serverInvoker_1.default(url, validate, waiting, form, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.Form, services_1.default.ResponseProcessor);
            }
        };
        OlivePage.prototype.fixAlertIssues = function () {
            if (!$.fn.tooltip.Constructor) {
                $.fn.tooltip.Constructor = {};
            }
            window.alertify = window.require("alertify")();
        };
        OlivePage.prototype.onInit = function (action) { this.initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this.preInitializeActions.push(action); };
        OlivePage.prototype.onViewChanged = function (container, trigger, newPage, firstTime) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (newPage === void 0) { newPage = false; }
            if (firstTime === void 0) { firstTime = false; }
            var standardAction = this.getService(services_1.default.StandardAction);
            standardAction.runStartup(container, trigger, "PreInit");
            try {
                this.initialize();
            }
            catch (error) {
                alert("initialization failed: " + error);
            }
            standardAction.runStartup(container, trigger, "Init");
            if (newPage) {
                $("[autofocus]:not([data-autofocus=disabled]):first").focus();
                if (config_1.default.REDIRECT_SCROLLS_UP) {
                    $(window).scrollTop(0);
                }
            }
            if (firstTime) {
                this.modal.tryOpenFromUrl();
            }
        };
        OlivePage.prototype.initialize = function () {
            this.preInitializeActions.forEach(function (action) { return action(); });
            // =================== Standard Features ====================
            var grid = this.getService(services_1.default.Grid);
            grid.mergeActionButtons();
            grid.enableColumn($(".select-cols .apply"));
            grid.enableSelectCol($(".select-grid-cols .group-control"));
            grid.enableToggle($("th.select-all > input:checkbox"));
            this.getService(services_1.default.MasterDetail).enable($("[data-delete-subform]"));
            var paging = this.getService(services_1.default.Paging);
            paging.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
            var sorting = this.getService(services_1.default.Sorting);
            sorting.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
            paging.enableWithAjax($("a[data-pagination]"));
            sorting.enableAjaxSorting($("a[data-sort]"));
            sorting.setSortHeaderClass($("th[data-sort]"));
            var form = this.getService(services_1.default.Form);
            form.enablecleanUpNumberField($("[data-val-number]"));
            this.modal.enableEnsureHeight($("[data-toggle=tab]"));
            this.getService(services_1.default.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
            this.getService(services_1.default.Select)
                .enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_1.default.ModalHelper).enableLink($("[target='$modal'][href]"));
            this.getService(services_1.default.GroupingFactory).enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            this.getService(services_1.default.AutoCompleteFactory).enable($("input[autocomplete-source]"));
            this.getService(services_1.default.CKEditorFileManagerFactory)
                .enable($(".ckeditor-file-uri"));
            this.getService(services_1.default.GlobalSearchFactory).enable($("input[data-search-source]"));
            this.getService(services_1.default.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
            this.getService(services_1.default.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
            this.getService(services_1.default.TimeControlFactory).enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            this.getService(services_1.default.HtmlEditorFactory).enable($("[data-control=html-editor]"));
            numericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            this.getService(services_1.default.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
            this.getService(services_1.default.FileUploadFactory).enable($(".file-upload input:file"));
            this.getService(services_1.default.ConfirmBoxFactory).enable($("[data-confirm-question]"));
            passwordStength_1.default.enable($(".password-strength"));
            subMenu_1.default.enable($(".with-submenu"));
            subMenu_1.default.createAccordion($("ul.accordion"));
            this.enableCustomCheckbox();
            this.enableCustomRadio();
            this.customizeValidationTooltip();
            // =================== Request lifecycle ====================
            this.getService(services_1.default.WindowEx).enableBack($(window));
            this.getService(services_1.default.AjaxRedirect).enableRedirect($("a[data-redirect=ajax]"));
            form.enablesubmitCleanGet($("form[method=get]"));
            var formAction = this.getService(services_1.default.ServerInvoker);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_1.default.MasterDetail).updateSubFormStates();
            this.modal.adjustHeight();
            this.initializeActions.forEach(function (action) { return action(); });
            window.testingContext.onPageInitialized();
            try {
                $.validator.unobtrusive.parse("form");
            }
            catch (error) {
                console.error(error);
            }
        };
        OlivePage.prototype.enableCustomCheckbox = function () {
            var all = $("input[type=checkbox]");
            var shouldSkip = $(".as-cards-input input[type=checkbox]");
            customCheckbox_1.default.enable(all.not(shouldSkip));
        };
        OlivePage.prototype.enableCustomRadio = function () {
            var all = $("input[type=radio]");
            var shouldSkip = $(".as-cards-input input[type=radio]");
            customRadio_1.default.enable(all.not(shouldSkip));
        };
        OlivePage.prototype.goBack = function (target) {
            var url = this.getService(services_1.default.Url);
            var returnUrl = url.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]")) {
                this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true);
            }
            else {
                url.goBack();
            }
            return false;
        };
        OlivePage.prototype.customizeValidationTooltip = function () { };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").length === 1 || $("main").length === 2) {
                // if there is an ajax modal available, then we have 2 main elements.
                this.getService(services_1.default.AjaxRedirect)
                    .go(location.href, null, false /*isBack*/, keepScroll, false);
            }
            else {
                location.reload();
            }
            return false;
        };
        OlivePage.prototype.getService = function (key) {
            return this.services.getService(key);
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWdEQTtRQU1JO1lBQUEsaUJBZ0NDO1lBbU1TLHNCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUd2Qix5QkFBb0IsR0FBRyxFQUFFLENBQUM7WUFyT2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDO1lBRXZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEMsMEJBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFjLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFVLGtCQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUQsTUFBTSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFpQixrQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRWpGLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBRTFCLHdEQUF3RDtZQUN4RCxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNSLE9BQU8sRUFBRSxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFFO2FBQ3BELENBQUMsQ0FBQztZQUVILENBQUMsQ0FBQztnQkFDRSw4RUFBOEU7Z0JBQzlFLG1EQUFtRDtnQkFDbkQsMEVBQTBFO2dCQUMxRSxLQUFJLENBQUMsVUFBVSxDQUFRLGtCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3JELEtBQUksQ0FBQyxVQUFVLENBQVcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDekQsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVB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