define(["require", "exports", "olive/Config", "olive/Mvc/FormAction", "olive/Mvc/AjaxRedirect", "olive/Mvc/StandardAction", "olive/Components/Form", "olive/Components/Url", "olive/Extensions/SystemExtensins", "olive/Components/Modal", "olive/Components/Validate", "olive/Components/Sorting", "olive/Components/Paging", "olive/Components/MasterDetail", "olive/Components/Alert", "olive/Components/Grid", "olive/Plugins/Select", "olive/Plugins/PasswordStength", "olive/Plugins/HtmlEditor", "olive/Plugins/TimeControl", "olive/Plugins/AutoComplete", "olive/Plugins/Slider", "olive/Plugins/DatePicker", "olive/Plugins/NumericUpDown", "olive/Plugins/FileUpload", "olive/Plugins/ConfirmBox", "olive/Plugins/SubMenu", "olive/Plugins/InstantSearch", "olive/Plugins/DateDropdown"], function (require, exports, Config_1, FormAction_1, AjaxRedirect_1, StandardAction_1, Form_1, Url_1, SystemExtensins_1, Modal_1, Validate_1, Sorting_1, Paging_1, MasterDetail_1, Alert_1, Grid_1, Select_1, PasswordStength_1, HtmlEditor_1, TimeControl_1, AutoComplete_1, Slider_1, DatePicker_1, NumericUpDown_1, FileUpload_1, ConfirmBox_1, SubMenu_1, InstantSearch_1, DateDropdown_1) {
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
            $(".select-cols .apply").off("click.apply-columns").on("click.apply-columns", function (e) { return Grid_1.default.applyColumns(e); });
            $("[data-delete-subform]").off("click.delete-subform").on("click.delete-subform", function (e) { return MasterDetail_1.default.deleteSubForm(e); });
            $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal", function (e) { return _this.openLinkModal(e); });
            $(".select-grid-cols .group-control").each(function (i, e) { return Grid_1.default.enableSelectColumns($(e)); });
            $("th.select-all > input:checkbox").off("click.select-all").on("click.select-all", function (e) { return Grid_1.default.enableSelectAllToggle(e); });
            $("[data-user-help]").each(function (i, e) { return _this.enableUserHelp($(e)); });
            $("form input, form select").off("keypress.default-button").on("keypress.default-button", function (e) { return Form_1.default.onDefaultButtonKeyPress(e); });
            $("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']").off("change.pagination-size").on("change.pagination-size", function (e) { return Paging_1.default.onSizeChanged(e); });
            $("[data-sort-item]").parents("tbody").each(function (i, e) { return Sorting_1.default.enableDragSort($(e)); });
            $("a[data-pagination]").off("click.ajax-paging").on("click.ajax-paging", function (e) { return Paging_1.default.enableWithAjax(e); });
            $("a[data-sort]").off("click.ajax-sorting").on("click.ajax-sorting", function (e) { return Sorting_1.default.enableAjaxSorting(e); });
            $("th[data-sort]").each(function (i, e) { return Sorting_1.default.setSortHeaderClass($(e)); });
            $("[data-val-number]").off("blur.cleanup-number").on("blur.cleanup-number", function (e) { return Form_1.default.cleanUpNumberField($(e.currentTarget)); });
            $("[data-toggle=tab]").off("click.tab-toggle").on("click.tab-toggle", function () { return Modal_1.default.ensureHeight(); });
            $("select.form-control").each(function (i, e) { return Select_1.default.enhance($(e)); });
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            //$.validator.unobtrusive.parse('form');
            // =================== Plug-ins ====================
            $("[name=InstantSearch]").each(function (i, e) { return new InstantSearch_1.default($(e)).enable(); });
            $("input[autocomplete-source]").each(function (i, e) { return new AutoComplete_1.default($(e)).handle(); });
            $("[data-control=date-picker],[data-control=calendar]").each(function (i, e) { return new DatePicker_1.default($(e)); });
            $("[data-control='date-picker|time-picker']").each(function (i, e) { return new TimeControl_1.default($(e)); });
            $("[data-control=time-picker]").each(function (i, e) { return new TimeControl_1.default($(e)); });
            $("[data-control=date-drop-downs]").each(function (i, e) { return DateDropdown_1.default.enable($(e)); });
            $("[data-control=html-editor]").each(function (i, e) { return new HtmlEditor_1.default($(e)).enable(); });
            $("[data-control=numeric-up-down]").each(function (i, e) { return new NumericUpDown_1.default($(e)).enable(); });
            $("[data-control=range-slider],[data-control=slider]").each(function (i, e) { return new Slider_1.default($(e)).enable(); });
            $(".file-upload input:file").each(function (i, e) { return new FileUpload_1.default($(e)).enable(); });
            $("[data-confirm-question]").each(function (i, e) { return new ConfirmBox_1.default($(e)).enable(); });
            $(".password-strength").each(function (i, e) { return PasswordStength_1.default.enable($(e)); });
            $(".with-submenu").each(function (i, e) { return new SubMenu_1.default($(e)); });
            // =================== Request lifecycle ====================
            $(window).off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return AjaxRedirect_1.default.back(e); });
            $("a[data-redirect=ajax]").off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return AjaxRedirect_1.default.enable(e); });
            $('form[method=get]').off("submit.clean-up").on("submit.clean-up", function (e) { return Form_1.default.submitCleanGet(e); });
            $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("formaction"), false); });
            $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return FormAction_1.default.invokeWithPost(e); });
            $("[data-change-action]").off("change.data-action").on("change.data-action", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false); });
            $("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]").off("dp.change.data-action").on("dp.change.data-action", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false); });
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
        OlivePage.prototype.enableUserHelp = function (element) {
            element.click(function () { return false; });
            var message = element.attr('data-user-help'); // todo: unescape message and conver to html
            element['popover']({ trigger: 'focus', content: message });
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=OlivePage.js.map