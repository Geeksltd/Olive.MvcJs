define(["require", "exports", "olive/config", "olive/mvc/formAction", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensins", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp"], function (require, exports, Config_1, FormAction_1, AjaxRedirect_1, StandardAction_1, Form_1, Url_1, SystemExtensins_1, Modal_1, Validate_1, Sorting_1, Paging_1, MasterDetail_1, Alert_1, Waiting_1, Grid_1, Select_1, PasswordStength_1, HtmlEditor_1, TimeControl_1, AutoComplete_1, Slider_1, DatePicker_1, NumericUpDown_1, FileUpload_1, ConfirmBox_1, SubMenu_1, InstantSearch_1, DateDropdown_1, UserHelp_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.modal = Modal_1.default;
            this.waiting = Waiting_1.default;
            this._initializeActions = [];
            this._preInitializeActions = [];
            SystemExtensins_1.default.initialize();
            Modal_1.default.initialize();
            $(function () {
                //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
                //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                Alert_1.default.enableAlert();
                Validate_1.default.configure();
                _this.onViewChanged(null, null, true);
            });
            // TODO: Find a cleaner way.
            window["alertify"] = window.require("alertify")();
            FormAction_1.default.onViewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
        }
        OlivePage.prototype.onInit = function (action) { this._initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this._preInitializeActions.push(action); };
        OlivePage.prototype.onViewChanged = function (container, trigger, newPage) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (newPage === void 0) { newPage = false; }
            StandardAction_1.default.runStartup(container, trigger, "PreInit");
            this.initialize();
            StandardAction_1.default.runStartup(container, trigger, "Init");
            if (newPage) {
                $('[autofocus]:not([data-autofocus=disabled]):first').focus();
                if (Config_1.default.REDIRECT_SCROLLS_UP)
                    $(window).scrollTop(0);
            }
        };
        OlivePage.prototype.initialize = function () {
            this._preInitializeActions.forEach(function (action) { return action(); });
            // =================== Standard Features ====================
            Grid_1.default.enableColumn($(".select-cols .apply"));
            Grid_1.default.enableSelectCol($(".select-grid-cols .group-control"));
            Grid_1.default.enableToggle($("th.select-all > input:checkbox"));
            MasterDetail_1.default.enable($("[data-delete-subform]"));
            Form_1.default.enableDefaultButtonKeyPress($("form input, form select"));
            Paging_1.default.enableOnSizeChanged($("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']"));
            Sorting_1.default.enableDragSort($("[data-sort-item]").parents("tbody"));
            Paging_1.default.enableWithAjax($("a[data-pagination]"));
            Sorting_1.default.enableAjaxSorting($("a[data-sort]"));
            Sorting_1.default.setSortHeaderClass($("th[data-sort]"));
            Form_1.default.enablecleanUpNumberField($("[data-val-number]"));
            Modal_1.default.enalbeEnsureHeight($("[data-toggle=tab]"));
            Select_1.default.enableEnhance($("select.form-control"));
            UserHelp_1.default.enable($("[data-user-help]"));
            StandardAction_1.default.enableLinkModal($("[target='$modal'][href]"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            //$.validator.unobtrusive.parse('form');
            // =================== Plug-ins ====================
            InstantSearch_1.default.enable($("[name=InstantSearch]"));
            AutoComplete_1.default.enable($("input[autocomplete-source]"));
            DatePicker_1.default.enable($("[data-control=date-picker],[data-control=calendar]"));
            TimeControl_1.default.enable($("[data-control='date-picker|time-picker']"));
            TimeControl_1.default.enable($("[data-control=time-picker]"));
            DateDropdown_1.default.enable($("[data-control=date-drop-downs]"));
            HtmlEditor_1.default.enable($("[data-control=html-editor]"));
            NumericUpDown_1.default.enable($("[data-control=numeric-up-down]"));
            Slider_1.default.enable($("[data-control=range-slider],[data-control=slider]"));
            FileUpload_1.default.enable($(".file-upload input:file"));
            ConfirmBox_1.default.enable($("[data-confirm-question]"));
            PasswordStength_1.default.enable($(".password-strength"));
            SubMenu_1.default.enable($(".with-submenu"));
            // =================== Request lifecycle ====================
            AjaxRedirect_1.default.enableBack($(window));
            AjaxRedirect_1.default.enableRedirect($("a[data-redirect=ajax]"));
            Form_1.default.enablesubmitCleanGet($('form[method=get]'));
            FormAction_1.default.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            FormAction_1.default.enableinvokeWithPost($("[formaction][formmethod=post]"));
            FormAction_1.default.enableInvokeWithAjax($("[data-change-action]"), "change.data-action", "change.data-action");
            FormAction_1.default.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]"), "dp.change.data-action", "data-change-action");
            MasterDetail_1.default.updateSubFormStates();
            Modal_1.default.adjustHeight();
            this._initializeActions.forEach(function (action) { return action(); });
        };
        OlivePage.prototype.goBack = function (target) {
            var returnUrl = Url_1.default.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
                AjaxRedirect_1.default.go(returnUrl, $(target), false, false, true);
            else
                Url_1.default.goBack();
            return false;
        };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").parent().is("body"))
                AjaxRedirect_1.default.go(location.href, null, false /*isBack*/, keepScroll, false);
            else
                location.reload();
            return false;
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL09saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQWtDQTtRQUtJO1lBQUEsaUJBZUM7WUFsQk0sVUFBSyxHQUFHLGVBQUssQ0FBQztZQUNkLFlBQU8sR0FBRyxpQkFBTyxDQUFDO1lBbUJ6Qix1QkFBa0IsR0FBRyxFQUFFLENBQUM7WUFHeEIsMEJBQXFCLEdBQUcsRUFBRSxDQUFDO1lBbkJ2Qix5QkFBZSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzdCLGVBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVuQixDQUFDLENBQUM7Z0JBQ0UseUhBQXlIO2dCQUN6SCx5RUFBeUU7Z0JBQ3pFLGVBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDcEIsa0JBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDckIsS0FBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsNEJBQTRCO1lBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBNkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQzVFLG9CQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7UUFHRCwwQkFBTSxHQUFOLFVBQU8sTUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBR3ZELDZCQUFTLEdBQVQsVUFBVSxNQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FB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