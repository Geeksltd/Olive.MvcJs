define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "./mvc/responseProcessor", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "./mvc/serverInvoker", "./mvc/windowEx", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "./plugins/multiSelect", "./plugins/customCheckbox", "./plugins/customRadio", "./plugins/ckEditorFileManager", "./components/grouping", "./di/serviceContainer", "./di/services"], function (require, exports, config_1, crossDomainEvent_1, responseProcessor_1, ajaxRedirect_1, standardAction_1, serverInvoker_1, windowEx_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.waiting = waiting_1.default;
            this._initializeActions = [];
            this._preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            this.modal = this.getService(services_1.default.ModalHelper);
            this.initializeServices();
            //ASP.NET needs this config for Request.IsAjaxRequest()
            $.ajaxSetup({
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });
            $(function () {
                //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
                //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                _this.getService(services_1.default.Alert).enableAlert();
                _this.getService(services_1.default.Validate).configure();
                _this.onViewChanged(null, null, true, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            this.getService(services_1.default.ResponseProcessor).viewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_1.default.handle('refresh-page', function (x) { return _this.refresh(); });
        }
        OlivePage.prototype.initializeServices = function () {
            this.modal.initialize();
            this.getService(services_1.default.StandardAction).initialize();
            this.getService(services_1.default.Validate).initialize();
            this.getService(services_1.default.MasterDetail).initialize();
        };
        OlivePage.prototype.configureServices = function (services) {
            var out = {};
            services.tryAddSingleton(services_1.default.Alert, function () { return new alert_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Url, function () { return new url_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Grid, function () { return new grid_1.default(); }, out);
            services.tryAddSingleton(services_1.default.MultiSelect, function () { return new multiSelect_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Select, function () { return new select_1.default(); }, out);
            services.tryAddSingleton(services_1.default.ResponseProcessor, function () { return new responseProcessor_1.default(); }, out);
            if (services.tryAddSingleton(services_1.default.Waiting, function (url) { return new waiting_1.default(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
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
            if (services.tryAddSingleton(services_1.default.StandardAction, function (alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper) {
                return new standardAction_1.default(alert, form, waiting, ajaxRedirect, responseProcessor, select, modalHelper);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.Form, services_1.default.Waiting, services_1.default.AjaxRedirect, services_1.default.ResponseProcessor, services_1.default.Select, services_1.default.ModalHelper);
            }
            if (services.tryAddSingleton(services_1.default.ServerInvoker, function (url, validate, waiting, form, responseProcessor) {
                return new serverInvoker_1.default(url, validate, waiting, form, responseProcessor);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.Form, services_1.default.ResponseProcessor);
            }
        };
        OlivePage.prototype.fixAlertIssues = function () {
            if (!$.fn.tooltip.Constructor)
                $.fn.tooltip.Constructor = {};
            window["alertify"] = window.require("alertify")();
        };
        OlivePage.prototype.onInit = function (action) { this._initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this._preInitializeActions.push(action); };
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
                $('[autofocus]:not([data-autofocus=disabled]):first').focus();
                if (config_1.default.REDIRECT_SCROLLS_UP)
                    $(window).scrollTop(0);
            }
            if (firstTime)
                this.modal.tryOpenFromUrl();
        };
        OlivePage.prototype.initialize = function () {
            this._preInitializeActions.forEach(function (action) { return action(); });
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
            this.getService(services_1.default.Select).enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_1.default.ModalHelper).enableLink($("[target='$modal'][href]"));
            this.getService(services_1.default.GroupingFactory).enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            this.getService(services_1.default.AutoCompleteFactory).enable($("input[autocomplete-source]"));
            this.getService(services_1.default.CKEditorFileManagerFactory).enable($(".ckeditor-file-uri"));
            globalSearch_1.default.enable($("input[data-search-source]"));
            this.getService(services_1.default.DatePickerFactory).enable($("[data-control=date-picker],[data-control=calendar]"));
            this.getService(services_1.default.DateTimePickerFactory).enable($("[data-control='date-picker|time-picker']"));
            this.getService(services_1.default.TimeControlFactory).enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            this.getService(services_1.default.HtmlEditorFactory).enable($("[data-control=html-editor]"));
            numericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            this.getService(services_1.default.SliderFactory).enable($("[data-control=range-slider],[data-control=slider]"));
            this.getService(services_1.default.FileUploadFactory).enable($(".file-upload input:file"));
            confirmBox_1.default.enable($("[data-confirm-question]"));
            passwordStength_1.default.enable($(".password-strength"));
            subMenu_1.default.enable($(".with-submenu"));
            subMenu_1.default.createAccordion($("ul.accordion"));
            this.enableCustomCheckbox();
            this.enableCustomRadio();
            this.customizeValidationTooltip();
            // =================== Request lifecycle ====================
            this.getService(services_1.default.WindowEx).enableBack($(window));
            this.getService(services_1.default.AjaxRedirect).enableRedirect($("a[data-redirect=ajax]"));
            form.enablesubmitCleanGet($('form[method=get]'));
            var formAction = this.getService(services_1.default.ServerInvoker);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_1.default.MasterDetail).updateSubFormStates();
            this.modal.adjustHeight();
            this._initializeActions.forEach(function (action) { return action(); });
            window["IsOliveMvcLoaded"] = true;
            try {
                $.validator.unobtrusive.parse('form');
            }
            catch (error) {
                console.error(error);
            }
        };
        OlivePage.prototype.enableCustomCheckbox = function () {
            customCheckbox_1.default.enable($("input[type=checkbox]"));
        };
        OlivePage.prototype.enableCustomRadio = function () {
            customRadio_1.default.enable($("input[type=radio]"));
        };
        OlivePage.prototype.goBack = function (target) {
            var url = this.getService(services_1.default.Url);
            var returnUrl = url.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
                this.getService(services_1.default.AjaxRedirect).go(returnUrl, $(target), false, false, true);
            else
                url.goBack();
            return false;
        };
        OlivePage.prototype.customizeValidationTooltip = function () {
        };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").length == 1 || $("main").length === 2) //if there is an ajax modal available, then we have 2 main elements.
                this.getService(services_1.default.AjaxRedirect).go(location.href, null, false /*isBack*/, keepScroll, false);
            else
                location.reload();
            return false;
        };
        OlivePage.prototype.getService = function (key) {
            return this.services.getService(key);
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQStDQTtRQU9JO1lBQUEsaUJBNEJDO1lBOUJNLFlBQU8sR0FBRyxpQkFBTyxDQUFDO1lBbUxmLHVCQUFrQixHQUFHLEVBQUUsQ0FBQztZQUd4QiwwQkFBcUIsR0FBRyxFQUFFLENBQUM7WUFuTGpDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxtQ0FBZ0IsRUFBRSxDQUFDO1lBRXZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFdEMsMEJBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFjLGtCQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFMUIsdURBQXVEO1lBQ3ZELENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ1IsT0FBTyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUU7YUFDcEQsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDO2dCQUNFLHlIQUF5SDtnQkFDekgseUVBQXlFO2dCQUN6RSxLQUFJLENBQUMsVUFBVSxDQUFRLGtCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3JELEtBQUksQ0FBQyxVQUFVLENBQVcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDekQsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztZQUVILDRCQUE0QjtZQUM1QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBb0Isa0JB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