define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/formAction", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp"], function (require, exports, config_1, crossDomainEvent_1, formAction_1, ajaxRedirect_1, standardAction_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.modal = modal_1.default;
            this.waiting = waiting_1.default;
            this._initializeActions = [];
            this._preInitializeActions = [];
            systemExtensions_1.default.initialize();
            modal_1.default.initialize();
            $(function () {
                //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
                //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                alert_1.default.enableAlert();
                validate_1.default.configure();
                _this.onViewChanged(null, null, true);
            });
            // TODO: Find a cleaner way.
            this.fixAlertIssues();
            formAction_1.default.onViewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_1.default.handle('refresh-page', function (x) { return _this.refresh(); });
        }
        OlivePage.prototype.fixAlertIssues = function () {
            if (!$.fn.tooltip.Constructor)
                $.fn.tooltip.Constructor = {};
            window["alertify"] = window.require("alertify")();
        };
        OlivePage.prototype.onInit = function (action) { this._initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this._preInitializeActions.push(action); };
        OlivePage.prototype.onViewChanged = function (container, trigger, newPage) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (newPage === void 0) { newPage = false; }
            standardAction_1.default.runStartup(container, trigger, "PreInit");
            this.initialize();
            standardAction_1.default.runStartup(container, trigger, "Init");
            if (newPage) {
                $('[autofocus]:not([data-autofocus=disabled]):first').focus();
                if (config_1.default.REDIRECT_SCROLLS_UP)
                    $(window).scrollTop(0);
            }
        };
        OlivePage.prototype.initialize = function () {
            this._preInitializeActions.forEach(function (action) { return action(); });
            // =================== Standard Features ====================
            grid_1.default.enableColumn($(".select-cols .apply"));
            grid_1.default.enableSelectCol($(".select-grid-cols .group-control"));
            grid_1.default.enableToggle($("th.select-all > input:checkbox"));
            masterDetail_1.default.enable($("[data-delete-subform]"));
            paging_1.default.enableOnSizeChanged($("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']"));
            sorting_1.default.enableDragSort($("[data-sort-item]").parents("tbody"));
            paging_1.default.enableWithAjax($("a[data-pagination]"));
            sorting_1.default.enableAjaxSorting($("a[data-sort]"));
            sorting_1.default.setSortHeaderClass($("th[data-sort]"));
            form_1.default.enablecleanUpNumberField($("[data-val-number]"));
            modal_1.default.enalbeEnsureHeight($("[data-toggle=tab]"));
            select_1.default.enableEnhance($("select.form-control"));
            form_1.default.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            standardAction_1.default.enableLinkModal($("[target='$modal'][href]"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            //$.validator.unobtrusive.parse('form');
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            autoComplete_1.default.enable($("input[autocomplete-source]"));
            datePicker_1.default.enable($("[data-control=date-picker],[data-control=calendar]"));
            dateTimePicker_1.default.enable($("[data-control='date-picker|time-picker']"));
            timeControl_1.default.enable($("[data-control=time-picker]"));
            dateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            htmlEditor_1.default.enable($("[data-control=html-editor]"));
            numericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            slider_1.default.enable($("[data-control=range-slider],[data-control=slider]"));
            fileUpload_1.default.enable($(".file-upload input:file"));
            confirmBox_1.default.enable($("[data-confirm-question]"));
            passwordStength_1.default.enable($(".password-strength"));
            subMenu_1.default.enable($(".with-submenu"));
            // =================== Request lifecycle ====================
            ajaxRedirect_1.default.enableBack($(window));
            ajaxRedirect_1.default.enableRedirect($("a[data-redirect=ajax]"));
            form_1.default.enablesubmitCleanGet($('form[method=get]'));
            formAction_1.default.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction_1.default.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction_1.default.enableInvokeWithAjax($("[data-change-action]"), "change.data-action", "data-change-action");
            formAction_1.default.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]"), "dp.change.data-action", "data-change-action");
            masterDetail_1.default.updateSubFormStates();
            modal_1.default.adjustHeight();
            this._initializeActions.forEach(function (action) { return action(); });
            window["IsOliveMvcLoaded"] = true;
        };
        OlivePage.prototype.goBack = function (target) {
            var returnUrl = url_1.default.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
                ajaxRedirect_1.default.go(returnUrl, $(target), false, false, true);
            else
                url_1.default.goBack();
            return false;
        };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").parent().is("body"))
                ajaxRedirect_1.default.go(location.href, null, false /*isBack*/, keepScroll, false);
            else
                location.reload();
            return false;
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQW9DQTtRQUtJO1lBQUEsaUJBZ0JDO1lBbkJNLFVBQUssR0FBRyxlQUFLLENBQUM7WUFDZCxZQUFPLEdBQUcsaUJBQU8sQ0FBQztZQXlCekIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1lBR3hCLDBCQUFxQixHQUFHLEVBQUUsQ0FBQztZQXpCdkIsMEJBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUIsZUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRW5CLENBQUMsQ0FBQztnQkFDRSx5SEFBeUg7Z0JBQ3pILHlFQUF5RTtnQkFDekUsZUFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixrQkFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQixLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLG9CQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQyxDQUFDO1lBQzlGLDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsT0FBTyxFQUFFLEVBQWQsQ0FBYyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELGtDQUFjLEdBQWQ7WUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztnQkFBQyxDQUFD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