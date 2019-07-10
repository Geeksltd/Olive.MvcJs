define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/formAction", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp", "./plugins/multiSelect", "./plugins/customCheckbox", "./plugins/customRadio", "./plugins/ckEditorFileManager", "./components/grouping", "./di/serviceContainer", "./di/services"], function (require, exports, config_1, crossDomainEvent_1, formAction_1, ajaxRedirect_1, standardAction_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1, multiSelect_1, customCheckbox_1, customRadio_1, ckEditorFileManager_1, grouping_1, serviceContainer_1, services_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.modal = modal_1.default;
            this.waiting = waiting_1.default;
            this._initializeActions = [];
            this._preInitializeActions = [];
            this.services = new serviceContainer_1.ServiceContainer();
            this.configureServices(this.services);
            systemExtensions_1.default.initialize();
            modal_1.default.initialize();
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
            this.getService(services_1.default.FormAction).onViewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_1.default.handle('refresh-page', function (x) { return _this.refresh(); });
        }
        OlivePage.prototype.configureServices = function (services) {
            var out = {};
            services.tryAddSingleton(services_1.default.Alert, function () { return new alert_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Url, function () { return new url_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Grid, function () { return new grid_1.default(); }, out);
            services.tryAddSingleton(services_1.default.MultiSelect, function () { return new multiSelect_1.default(); }, out);
            services.tryAddSingleton(services_1.default.Select, function () { return new select_1.default(); }, out);
            if (services.tryAddSingleton(services_1.default.Waiting, function (url) { return new waiting_1.default(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.CKEditorFileManagerFactory, function (url) { return new ckEditorFileManager_1.CKEditorFileManagerFactory(url); }, out)) {
                out.value.withDependencies(services_1.default.Url);
            }
            if (services.tryAddSingleton(services_1.default.Sorting, function (url, formAction) { return new sorting_1.default(url, formAction); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.FormAction);
            }
            if (services.tryAddSingleton(services_1.default.Paging, function (url, formAction) { return new paging_1.default(url, formAction); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.FormAction);
            }
            if (services.tryAddSingleton(services_1.default.FileUploadFactory, function (url, formAction) { return new fileUpload_1.FileUploadFactory(url, formAction); }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.FormAction);
            }
            if (services.tryAddSingleton(services_1.default.SliderFactory, function (form) { return new slider_1.SliderFactory(form); }, out)) {
                out.value.withDependencies(services_1.default.Form);
            }
            if (services.tryAddSingleton(services_1.default.AjaxRedirect, function (url, formAction, waiting) {
                return new ajaxRedirect_1.default(url, formAction, waiting);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.FormAction, services_1.default.Waiting);
            }
            if (services.tryAddSingleton(services_1.default.Form, function (url, validate, waiting, ajaxRedirect) {
                return new form_1.default(url, validate, waiting, ajaxRedirect);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.Waiting, services_1.default.AjaxRedirect);
            }
            if (services.tryAddSingleton(services_1.default.Validate, function (alert) { return new validate_1.default(alert); }, out)) {
                out.value.withDependencies(services_1.default.Alert);
            }
            if (services.tryAddSingleton(services_1.default.MasterDetail, function (validate) { return new masterDetail_1.default(validate); }, out)) {
                out.value.withDependencies(services_1.default.Validate);
            }
            if (services.tryAddSingleton(services_1.default.StandardAction, function (alert, form, formAction, waiting, ajaxRedirect, select) {
                return new standardAction_1.default(alert, form, formAction, waiting, ajaxRedirect, select);
            }, out)) {
                out.value.withDependencies(services_1.default.Alert, services_1.default.Form, services_1.default.FormAction, services_1.default.Waiting, services_1.default.AjaxRedirect, services_1.default.Select);
            }
            if (services.tryAddSingleton(services_1.default.FormAction, function (url, validate, masterDetail, standardAction, form, waiting) {
                return new formAction_1.default(url, validate, masterDetail, standardAction, form, waiting);
            }, out)) {
                out.value.withDependencies(services_1.default.Url, services_1.default.Validate, services_1.default.MasterDetail, services_1.default.StandardAction, services_1.default.Form, services_1.default.Waiting);
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
            //if (firstTime) Modal.tryOpenFromUrl();
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
            modal_1.default.enableEnsureHeight($("[data-toggle=tab]"));
            this.getService(services_1.default.MultiSelect).enableEnhance($("select[data-control='collapsible-checkboxes']"));
            this.getService(services_1.default.Select).enableEnhance($("select:not([data-control='collapsible-checkboxes'])"));
            form.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            this.getService(services_1.default.StandardAction).enableLinkModal($("[target='$modal'][href]"));
            grouping_1.default.enable($(".form-group #GroupBy"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            autoComplete_1.default.enable($("input[autocomplete-source]"));
            this.getService(services_1.default.CKEditorFileManagerFactory).enable($(".ckeditor-file-uri"));
            globalSearch_1.default.enable($("input[data-search-source]"));
            datePicker_1.default.enable($("[data-control=date-picker],[data-control=calendar]"));
            dateTimePicker_1.default.enable($("[data-control='date-picker|time-picker']"));
            timeControl_1.default.enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            htmlEditor_1.default.enable($("[data-control=html-editor]"));
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
            var ajaxRedirect = this.getService(services_1.default.AjaxRedirect);
            ajaxRedirect.enableBack($(window));
            ajaxRedirect.enableRedirect($("a[data-redirect=ajax]"));
            form.enablesubmitCleanGet($('form[method=get]'));
            var formAction = this.getService(services_1.default.FormAction);
            formAction.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source]):not([data-control=collapsible-checkboxes])"), "change.data-action", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=collapsible-checkboxes]"), "hidden.bs.select", "data-change-action");
            formAction.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar],[data-change-action][data-control=time-picker]"), "dp.change.data-action", "data-change-action");
            this.getService(services_1.default.MasterDetail).updateSubFormStates();
            modal_1.default.adjustHeight();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQTZDQTtRQU9JO1lBQUEsaUJBeUJDO1lBNUJNLFVBQUssR0FBRyxlQUFLLENBQUM7WUFDZCxZQUFPLEdBQUcsaUJBQU8sQ0FBQztZQTRIekIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1lBR3hCLDBCQUFxQixHQUFHLEVBQUUsQ0FBQztZQTVIdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7WUFFdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV0QywwQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5QixlQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFbkIsdURBQXVEO1lBQ3ZELENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBQ1IsT0FBTyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUU7YUFDcEQsQ0FBQyxDQUFDO1lBRUgsQ0FBQyxDQUFDO2dCQUNFLHlIQUF5SDtnQkFDekgseUVBQXlFO2dCQUN6RSxLQUFJLENBQUMsVUFBVSxDQUFRLGtCQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3JELEtBQUksQ0FBQyxVQUFVLENBQVcsa0JBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDekQsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztZQUVILDRCQUE0QjtZQUM1QixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBYSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQXZELENBQXVELENBQUMsQ0FBQztZQUNwSSwwQkFBZ0IsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLE9BQU8sRUFBRSxFQUFkLENBQWMsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxxQ0FBaUIsR0FBakIsVUFBa0IsUUFBMEI7WUFDeEMsSUFBTSxHQUFHLEdBQWtDLEVBQUUsQ0FBQztZQUU5QyxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsS0FBSyxFQUFFLGNBQU0sT0FBQSxJQUFJLGVBQUssRUFBRSxFQUFYLENBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUVqRSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGNBQU0sT0FBQSxJQUFJLGFBQUcsRUFBRSxFQUFULENBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUU3RCxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsSUFBSSxFQUFFLGNBQU0sT0FBQSxJQUFJLGNBQUksRUFBRSxFQUFWLENBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUUvRCxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsV0FBVyxFQUFFLGNBQU0sT0FBQSxJQUFJLHFCQUFXLEVBQUUsRUFBakIsQ0FBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUU3RSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsTUFBTSxFQUFFLGNBQU0sT0FBQSxJQUFJLGdCQUFNLEVBQUUsRUFBWixDQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFbkUsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBUSxJQUFLLE9BQUEsSUFBSSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFoQixDQUFnQixFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNqRixHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDNUM7WUFFRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQywwQkFBMEIsRUFBRSxVQUFDLEdBQVEsSUFBSyxPQUFBLElBQUksZ0RBQTBCLENBQUMsR0FBRyxDQUFDLEVBQW5DLENBQW1DLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3ZILEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM1QztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLE9BQU8sRUFBRSxVQUFDLEdBQVEsRUFBRSxVQUFzQixJQUFLLE9BQUEsSUFBSSxpQkFBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsRUFBNUIsQ0FBNEIsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDckgsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEdBQUcsRUFBRSxrQkFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2pFO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsTUFBTSxFQUFFLFVBQUMsR0FBUSxFQUFFLFVBQXNCLElBQUssT0FBQSxJQUFJLGdCQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUEzQixDQUEyQixFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUNuSCxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFRLENBQUMsR0FBRyxFQUFFLGtCQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDakU7WUFFRCxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsa0JBQVEsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLEdBQVEsRUFBRSxVQUFzQixJQUFLLE9BQUEsSUFBSSw4QkFBaUIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEVBQXRDLENBQXNDLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pJLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNqRTtZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLGFBQWEsRUFBRSxVQUFDLElBQVUsSUFBSyxPQUFBLElBQUksc0JBQWEsQ0FBQyxJQUFJLENBQUMsRUFBdkIsQ0FBdUIsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDaEcsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsWUFBWSxFQUFFLFVBQUMsR0FBUSxFQUFFLFVBQXNCLEVBQUUsT0FBZ0I7Z0JBQ25HLE9BQUEsSUFBSSxzQkFBWSxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDO1lBQTFDLENBQTBDLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xELEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQVEsQ0FBQyxVQUFVLEVBQUUsa0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNuRjtZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLElBQUksRUFBRSxVQUFDLEdBQVEsRUFBRSxRQUFrQixFQUFFLE9BQWdCLEVBQUUsWUFBMEI7Z0JBQ25ILE9BQUEsSUFBSSxjQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDO1lBQTlDLENBQThDLEVBQUUsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RELEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQVEsQ0FBQyxHQUFHLEVBQUUsa0JBQVEsQ0FBQyxRQUFRLEVBQUUsa0JBQVEsQ0FBQyxPQUFPLEVBQUUsa0JBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUN4RztZQUVELElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBUSxDQUFDLFFBQVEsRUFBRSxVQUFDLEtBQVksSUFBSyxPQUFBLElBQUksa0JBQVEsQ0FBQyxLQUFLLENBQUMsRUFBbkIsQ0FBbUIsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDekYsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsWUFBWSxFQUFFLFVBQUMsUUFBa0IsSUFBSyxPQUFBLElBQUksc0JBQVksQ0FBQyxRQUFRLENBQUMsRUFBMUIsQ0FBMEIsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDMUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2pEO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsY0FBYyxFQUFFLFVBQUMsS0FBWSxFQUMvRCxJQUFVLEVBQ1YsVUFBc0IsRUFDdEIsT0FBZ0IsRUFDaEIsWUFBMEIsRUFDMUIsTUFBYztnQkFDZCxPQUFBLElBQUksd0JBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQztZQUExRSxDQUEwRSxFQUFFLEdBQUcsQ0FBQyxFQUNsRjtnQkFDRSxHQUFHLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUN0QixrQkFBUSxDQUFDLEtBQUssRUFDZCxrQkFBUSxDQUFDLElBQUksRUFDYixrQkFBUSxDQUFDLFVBQVUsRUFDbkIsa0JBQVEsQ0FBQyxPQUFPLEVBQ2hCLGtCQUFRLENBQUMsWUFBWSxFQUNyQixrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hCO1lBRUQsSUFBSSxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFRLENBQUMsVUFBVSxFQUFFLFVBQUMsR0FBUSxFQUN2RCxRQUFrQixFQUNsQixZQUEwQixFQUMxQixjQUE4QixFQUM5QixJQUFVLEVBQ1YsT0FBZ0I7Z0JBQ2hCLE9BQUEsSUFBSSxvQkFBVSxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDO1lBQTFFLENBQTBFLEVBQUUsR0FBRyxDQUFDLEVBQ2xGO2dCQUNFLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQ3RCLGtCQUFRLENBQUMsR0FBRyxFQUNaLGtCQUFRLENBQUMsUUFBUSxFQUNqQixrQkFBUSxDQUFDLFlBQVksRUFDckIsa0JBQVEsQ0FBQyxjQUFjLEVBQ3ZCLGtCQUFRLENBQUMsSUFBSSxFQUNiLGtCQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDekI7UUFDTCxDQUFDO1FBRUQsa0NBQWMsR0FBZDtZQUNJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXO2dCQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7WUFDN0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUE2QixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDaEYsQ0FBQztRQUdELDBCQUFNLEdBQU4sVUFBTyxNQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFHdkQsNkJBQVMsR0FBVCxVQUFVLE1BQU0sSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUU3RCxpQ0FBYSxHQUFiLFVBQWMsU0FBd0IsRUFBRSxPQUFtQixFQUFFLE9BQXdCLEVBQUUsU0FBMEI7WUFBbkcsMEJBQUEsRUFBQSxnQkFBd0I7WUFBRSx3QkFBQSxFQUFBLGNBQW1CO1lBQUUsd0JBQUEsRUFBQSxlQUF3QjtZQUFFLDBCQUFBLEVBQUEsaUJBQTBCO1lBQzdHLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQWlCLGtCQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDaEYsY0FBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELElBQUk7Z0JBQ0EsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2FBQ3JCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osS0FBSyxDQUFDLHlCQUF5QixHQUFHLEtBQUssQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsY0FBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRELElBQUksT0FBTyxFQUFFO2dCQUNULENBQUMsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5RCxJQUFJLGdCQUFNLENBQUMsbUJBQW1CO29CQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7WUFFRCx3Q0FBd0M7UUFDNUMsQ0FBQztRQUVELDhCQUFVLEdBQVY7WUFDSSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7WUFFekQsNkRBQTZEO1lBQzdELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQU8sa0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUN2RCxJQUFJLENBQUMsVUFBVSxDQUFlLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDeEYsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBUyxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO1lBQ2pHLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQVUsa0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMzRCxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDNUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDL0MsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBTyxrQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3RELGVBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ2pELElBQUksQ0FBQyxVQUFVLENBQWMsa0JBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLCtDQUErQyxDQUFDLENBQUMsQ0FBQztZQUNySCxJQUFJLENBQUMsVUFBVSxDQUFTLGtCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDLENBQUM7WUFDakgsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDL0Qsa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsVUFBVSxDQUFpQixrQkFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZHLGtCQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7WUFFM0MsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUM5RSxVQUFDLENBQU0sSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQW5GLENBQW1GLENBQUMsQ0FBQztZQUVyRyxvREFBb0Q7WUFDcEQsdUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUNoRCxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQUksQ0FBQyxVQUFVLENBQTZCLGtCQUFRLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqSCxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1lBQ3BELG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxvREFBb0QsQ0FBQyxDQUFDLENBQUM7WUFDM0Usd0JBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztZQUNyRSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ3BELHNCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDekQsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQztZQUNuRCx1QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxVQUFVLENBQWdCLGtCQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDLENBQUM7WUFDdEgsSUFBSSxDQUFDLFVBQVUsQ0FBb0Isa0JBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDaEQseUJBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoRCxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUM1QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUVsQyw2REFBNkQ7WUFDN0QsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBZSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBRWpELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQWEsa0JBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNwRSxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQzlHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsNEZBQTRGLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzdLLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsMkRBQTJELENBQUMsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzFJLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsMklBQTJJLENBQUMsRUFBRSx1QkFBdUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBRS9OLElBQUksQ0FBQyxVQUFVLENBQWUsa0JBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQzNFLGVBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVyQixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7WUFFdEQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRWxDLElBQUk7Z0JBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQUU7WUFDOUMsT0FBTyxLQUFLLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUFFO1FBQzNDLENBQUM7UUFFRCx3Q0FBb0IsR0FBcEI7WUFDSSx3QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUM7UUFFRCxxQ0FBaUIsR0FBakI7WUFDSSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFRCwwQkFBTSxHQUFOLFVBQU8sTUFBTTtZQUNULElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQU0sa0JBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUUvQyxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFDLElBQUksU0FBUyxJQUFJLE1BQU0sSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDO2dCQUMzRCxJQUFJLENBQUMsVUFBVSxDQUFlLGtCQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7Z0JBQ2pHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVsQixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsOENBQTBCLEdBQTFCO1FBRUEsQ0FBQztRQUVELDJCQUFPLEdBQVAsVUFBUSxVQUFrQjtZQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjtZQUN0QixJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLG9FQUFvRTtnQkFDckgsSUFBSSxDQUFDLFVBQVUsQ0FBZSxrQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQzs7Z0JBQ2pILFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUV2QixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU8sOEJBQVUsR0FBbEIsVUFBdUMsR0FBVztZQUM5QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDTCxnQkFBQztJQUFELENBQUMsQUF2UUQsSUF1UUMifQ==