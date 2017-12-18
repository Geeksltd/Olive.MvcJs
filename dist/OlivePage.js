define(["require", "exports", "olive/Config", "olive/Components/Form", "olive/Components/Url", "olive/Extensions/SystemExtensins", "olive/Components/Modal", "olive/Components/Validate", "olive/Components/Sorting", "olive/Components/Paging", "olive/Components/MasterDetail", "olive/Components/Alert", "olive/Components/FormAction", "olive/Components/AjaxRedirect", "olive/Components/Waiting", "olive/Components/Grid", "olive/Plugins/Select", "olive/Plugins/PasswordStength", "olive/Plugins/HtmlEditor", "olive/Plugins/TimeControl", "olive/Plugins/AutoComplete", "olive/Plugins/Slider", "olive/Plugins/DatePicker", "olive/Plugins/NumericUpDown", "olive/Plugins/FileUpload", "olive/Plugins/ConfirmBox", "olive/Plugins/SubMenu", "olive/Plugins/InstantSearch", "olive/Plugins/DateDropdown"], function (require, exports, Config_1, Form_1, Url_1, SystemExtensins_1, Modal_1, Validate_1, Sorting_1, Paging_1, MasterDetail_1, Alert_1, FormAction_1, AjaxRedirect_1, Waiting_1, Grid_1, Select_1, PasswordStength_1, HtmlEditor_1, TimeControl_1, AutoComplete_1, Slider_1, DatePicker_1, NumericUpDown_1, FileUpload_1, ConfirmBox_1, SubMenu_1, InstantSearch_1, DateDropdown_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            this.modal = null;
            this._initializeActions = [];
            this._preInitializeActions = [];
            this.dynamicallyLoadedScriptFiles = [];
            SystemExtensins_1.default.initialize();
            Modal_1.default.initialize();
            $(function () {
                //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
                //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                Alert_1.default.enableAlert();
                Validate_1.default.configure();
                _this.pageLoad();
            });
            // TODO: Find a cleaner way.
            window["alertify"] = window.require("alertify")();
        }
        OlivePage.prototype.onInit = function (action) { this._initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this._preInitializeActions.push(action); };
        OlivePage.prototype.pageLoad = function (container, trigger) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            $('[autofocus]:not([data-autofocus=disabled]):first').focus();
            this.initializeUpdatedPage(container, trigger);
            if (Config_1.default.REDIRECT_SCROLLS_UP)
                $(window).scrollTop(0);
        };
        OlivePage.prototype.initializeUpdatedPage = function (container, trigger) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            this.runStartupActions(container, trigger, "PreInit");
            this.initialize();
            this.runStartupActions(container, trigger, "Init");
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
            $(window).off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return AjaxRedirect_1.default.back(e, _this.invokeAjaxActionResult); });
            $("a[data-redirect=ajax]").off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return AjaxRedirect_1.default.enable(e, _this.invokeAjaxActionResult); });
            $('form[method=get]').off("submit.clean-up").on("submit.clean-up", function (e) { return _this.cleanGetFormSubmit(e); });
            $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("formaction"), false, _this.invokeAjaxActionResult); });
            $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return FormAction_1.default.invokeWithPost(e); });
            $("[data-change-action]").off("change.data-action").on("change.data-action", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false, _this.invokeAjaxActionResult); });
            $("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]").off("dp.change.data-action").on("dp.change.data-action", function (e) { return FormAction_1.default.invokeWithAjax(e, $(e.currentTarget).attr("data-change-action"), false, _this.invokeAjaxActionResult); });
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
            this.openModal(event);
            return false;
        };
        OlivePage.prototype.runStartupActions = function (container, trigger, stage) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            if (stage === void 0) { stage = "Init"; }
            if (container == null)
                container = $(document);
            if (trigger == null)
                trigger = $(document);
            var actions = [];
            $("input[name='Startup.Actions']", container).each(function (index, item) {
                var action = $(item).val();
                if (actions.indexOf(action) === -1)
                    actions.push(action);
            });
            for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                var action = actions_1[_i];
                if (action && (action.Stage || "Init") == stage)
                    this.executeActions(JSON.safeParse(action), trigger);
            }
        };
        OlivePage.prototype.goBack = function (target) {
            var returnUrl = Url_1.default.getQuery("ReturnUrl");
            if (returnUrl && target && $(target).is("[data-redirect=ajax]"))
                AjaxRedirect_1.default.go(returnUrl, $(target), false, false, true, this.invokeAjaxActionResult);
            else
                Url_1.default.goBack();
            return false;
        };
        OlivePage.prototype.cleanGetFormSubmit = function (event) {
            var form = $(event.currentTarget);
            if (Validate_1.default.validateForm(form) == false) {
                Waiting_1.default.hidePleaseWait();
                return false;
            }
            var formData = Form_1.default.merge(form.serializeArray()).filter(function (item) { return item.name != "__RequestVerificationToken"; });
            var url = Url_1.default.removeEmptyQueries(form.attr('action'));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = Url_1.default.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    url = Url_1.default.updateQuery(url, item.name, item.value);
                }
                url = Url_1.default.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]"))
                    AjaxRedirect_1.default.go(url, form, false, false, true, this.invokeAjaxActionResult);
                else
                    location.href = url;
            }
            catch (error) {
                console.log(error);
                alert(error);
            }
            return false;
        };
        OlivePage.prototype.executeActions = function (actions, trigger) {
            if (trigger === void 0) { trigger = null; }
            for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                var action = actions_2[_i];
                if (!this.executeAction(action, trigger))
                    return;
            }
        };
        OlivePage.prototype.executeAction = function (action, trigger) {
            if (action.Notify || action.Notify == "")
                this.executeNotifyAction(action, trigger);
            else if (action.Script)
                eval(action.Script);
            else if (action.BrowserAction == "Back")
                window.history.back();
            else if (action.BrowserAction == "CloseModal" && this.modal && this.modal.closeModal() === false)
                return false;
            else if (action.BrowserAction == "CloseModalRefreshParent")
                return this.refresh();
            else if (action.BrowserAction == "Close")
                window.close();
            else if (action.BrowserAction == "Refresh")
                this.refresh();
            else if (action.BrowserAction == "Print")
                window.print();
            else if (action.BrowserAction == "ShowPleaseWait")
                Waiting_1.default.showPleaseWait(action.BlockScreen);
            else if (action.ReplaceSource)
                Select_1.default.replaceSource(action.ReplaceSource, action.Items);
            else if (action.Download)
                window.download(action.Download);
            else if (action.Redirect)
                this.executeRedirectAction(action, trigger);
            else
                alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
            return true;
        };
        OlivePage.prototype.openModal = function (event, url, options) {
            if (this.modal) {
                this.modal.close();
                this.modal = false;
            }
            this.modal = new Modal_1.default(event, url, options);
            this.modal.open();
        };
        OlivePage.prototype.executeNotifyAction = function (action, trigger) {
            if (action.Obstruct == false)
                Alert_1.default.alertUnobtrusively(action.Notify, action.Style);
            else
                Alert_1.default.alert(action.Notify, action.Style);
        };
        OlivePage.prototype.executeRedirectAction = function (action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && window.isModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal(null, action.Redirect, {});
            else if (action.Target && action.Target != '')
                window.open(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
                AjaxRedirect_1.default.go(action.Redirect, trigger, false, false, true, this.invokeAjaxActionResult);
            else
                location.replace(action.Redirect);
        };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").parent().is("body"))
                AjaxRedirect_1.default.go(location.href, null, false /*isBack*/, keepScroll, false, this.invokeAjaxActionResult /*addToHistory:*/);
            else
                location.reload();
            return false;
        };
        OlivePage.prototype.replaceMain = function (element, trigger) {
            var _this = this;
            var referencedScripts = element.find("script[src]").map(function (i, s) { return $(s).attr("src"); });
            element.find("script[src]").remove();
            $("main").replaceWith(element);
            if (referencedScripts.length) {
                var expectedScripts = referencedScripts.length;
                var loadedScripts = 0;
                referencedScripts.each(function (index, item) {
                    var url = '' + item;
                    if (_this.dynamicallyLoadedScriptFiles.indexOf(url) > -1) {
                        loadedScripts++;
                        if (loadedScripts == expectedScripts)
                            _this.pageLoad(element, trigger);
                    }
                    else {
                        _this.dynamicallyLoadedScriptFiles.push(url);
                        $.getScript(url, function () {
                            loadedScripts++;
                            if (loadedScripts == expectedScripts)
                                _this.pageLoad(element, trigger);
                        });
                    }
                });
            }
            else
                this.pageLoad(element, trigger);
            document.title = $("#page_meta_title").val();
        };
        OlivePage.prototype.invokeAjaxActionResult = function (response, containerModule, trigger) {
            var asElement = $(response);
            if (asElement.is("main")) {
                this.replaceMain(asElement, trigger);
                return;
            }
            if (asElement.is("[data-module]")) {
                // TODO: Support specifying the module to be updated at the Action level.
                containerModule.replaceWith(asElement);
                this.initializeUpdatedPage(asElement, trigger);
            }
            else if (response.length == 1 && response[0].ReplaceView) {
                asElement = $("<div/>").append(response[0].ReplaceView);
                containerModule.replaceWith(asElement);
                this.initializeUpdatedPage(asElement, trigger);
            }
            else if (trigger && trigger.is("[data-add-subform]")) {
                var subFormName = trigger.attr("data-add-subform");
                var container = containerModule.find("[data-subform=" + subFormName + "] > table tbody:first");
                if (container.length == 0)
                    container = containerModule.find("[data-subform=" + subFormName + "]:first");
                container.append(asElement);
                Validate_1.default.reloadRules(trigger.parents("form"));
                MasterDetail_1.default.updateSubFormStates();
                this.initializeUpdatedPage(asElement, trigger);
            }
            else {
                this.executeActions(response, trigger);
                this.initialize();
            }
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