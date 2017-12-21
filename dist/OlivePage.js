define(["require", "exports", "olive/Config", "olive/Mvc/FormAction", "olive/Mvc/AjaxRedirect", "olive/Mvc/StandardAction", "olive/Components/Form", "olive/Components/Url", "olive/Extensions/SystemExtensins", "olive/Components/Modal", "olive/Components/Validate", "olive/Components/Sorting", "olive/Components/Paging", "olive/Components/MasterDetail", "olive/Components/Alert", "olive/Components/Grid", "olive/Plugins/Select", "olive/Plugins/PasswordStength", "olive/Plugins/HtmlEditor", "olive/Plugins/TimeControl", "olive/Plugins/AutoComplete", "olive/Plugins/Slider", "olive/Plugins/DatePicker", "olive/Plugins/NumericUpDown", "olive/Plugins/FileUpload", "olive/Plugins/ConfirmBox", "olive/Plugins/SubMenu", "olive/Plugins/InstantSearch", "olive/Plugins/DateDropdown", "olive/Plugins/UserHelp"], function (require, exports, Config_1, FormAction_1, AjaxRedirect_1, StandardAction_1, Form_1, Url_1, SystemExtensins_1, Modal_1, Validate_1, Sorting_1, Paging_1, MasterDetail_1, Alert_1, Grid_1, Select_1, PasswordStength_1, HtmlEditor_1, TimeControl_1, AutoComplete_1, Slider_1, DatePicker_1, NumericUpDown_1, FileUpload_1, ConfirmBox_1, SubMenu_1, InstantSearch_1, DateDropdown_1, UserHelp_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
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
        OlivePage.prototype.modal = function () { return Modal_1.default; };
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
            var _this = this;
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
            $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal", function (e) { return _this.openLinkModal(e); });
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
        OlivePage.prototype.skipNewWindows = function () {
            // Remove the target attribute from links:
            $(window).off('click.SanityAdapter').on('click.SanityAdapter', function (e) {
                $(e.target).filter('a').removeAttr('target');
            });
            window["open"] = function (url, r, f, re) { location.replace(url); return window; };
        };
        OlivePage.prototype.openLinkModal = function (event) {
            StandardAction_1.default.openModal(event);
            return false;
        };
        OlivePage.prototype.goBack = function (target) {
            var returnUrl = Url_1.default.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
                AjaxRedirect_1.default.go(returnUrl, $(target), false, false, true);
            else
                Url_1.default.goBack();
            return false;
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=OlivePage.js.map