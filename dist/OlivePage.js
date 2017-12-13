define(["require", "exports", "./Components/Form", "./Components/Url", "./Components/WindowContext", "./Plugins/TimeControl", "./Plugins/autoComplete", "./Plugins/slider", "./Plugins/datePicker", "./Plugins/numericUpDown", "./Plugins/FileUpload", "./Plugins/ConfirmBox", "./Plugins/subMenu"], function (require, exports, Form_1, Url_1, WindowContext_1, TimeControl_1, autoComplete_1, slider_1, datePicker_1, numericUpDown_1, FileUpload_1, ConfirmBox_1, subMenu_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    // For ckeditor plug-ins to work, this should be globally defined.
    var CKEDITOR_BASEPATH = '/lib/ckeditor/';
    var OlivePage = /** @class */ (function () {
        function OlivePage() {
            var _this = this;
            // formats: http://momentjs.com/docs/#/displaying/format/
            this.DATE_FORMAT = "DD/MM/YYYY";
            this.TIME_FORMAT = "HH:mm";
            this.DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";
            this.MINUTE_INTERVALS = 5;
            this.DISABLE_BUTTONS_DURING_AJAX = false;
            this.DATE_LOCALE = "en-gb";
            this.REDIRECT_SCROLLS_UP = true;
            this.AUTOCOMPLETE_INPUT_DELAY = 500;
            /* Possible values: Compact | Medium | Advance | Full
               To customise modes, change '/Scripts/Lib/ckeditor_config.js' file
               */
            this.DEFAULT_HTML_EDITOR_MODE = "Medium";
            this.DEFAULT_MODAL_BACKDROP = "static";
            this._initializeActions = [];
            this._preInitializeActions = [];
            //#region "Events"
            this.events = {};
            this.awaitingAutocompleteResponses = 0;
            this.ajaxChangedUrl = 0;
            this.isAjaxRedirecting = false;
            this.currentModal = null;
            this.isOpeningModal = false;
            this.isClosingModal = false;
            this.isAwaitingAjaxResponse = false;
            this.dynamicallyLoadedScriptFiles = [];
            $(function () {
                //$.fn.modal.Constructor.DEFAULTS = $.extend($.fn.modal.Constructor.DEFAULTS, { backdrop: this.DEFAULT_MODAL_BACKDROP });
                //$.fn.modal.Constructor.DEFAULTS.backdrop = this.DEFAULT_MODAL_BACKDROP;
                _this.enableAlert();
                _this.configureValidation();
                _this.pageLoad();
            });
        }
        OlivePage.prototype.onInit = function (action) { this._initializeActions.push(action); };
        OlivePage.prototype.onPreInit = function (action) { this._preInitializeActions.push(action); };
        OlivePage.prototype.on = function (event, handler) {
            if (!this.events.hasOwnProperty(event))
                this.events[event] = [];
            this.events[event].push(handler);
        };
        OlivePage.prototype.raise = function (event, data) {
            var result = true;
            if (this.events.hasOwnProperty(event)) {
                this.events[event].forEach(function (handler) {
                    var res = handler(data || {});
                    if (res === false)
                        result = false;
                });
            }
            return result;
        };
        //#endregion "Events"   
        OlivePage.prototype.pageLoad = function (container, trigger) {
            if (container === void 0) { container = null; }
            if (trigger === void 0) { trigger = null; }
            $('[autofocus]:not([data-autofocus=disabled]):first').focus();
            this.initializeUpdatedPage(container, trigger);
            if (this.REDIRECT_SCROLLS_UP)
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
            $(".select-cols .apply").off("click.apply-columns").on("click.apply-columns", function (e) { return _this.applyColumns(e); });
            $("[data-delete-subform]").off("click.delete-subform").on("click.delete-subform", function (e) { return _this.deleteSubForm(e); });
            $("[target='$modal'][href]").off("click.open-modal").on("click.open-modal", function (e) { return _this.openLinkModal(e); });
            $(".select-grid-cols .group-control").each(function (i, e) { return _this.enableSelectColumns($(e)); });
            $("[name=InstantSearch]").each(function (i, e) { return _this.enableInstantSearch($(e)); });
            $("th.select-all > input:checkbox").off("click.select-all").on("click.select-all", function (e) { return _this.enableSelectAllToggle(e); });
            $("[data-user-help]").each(function (i, e) { return _this.enableUserHelp($(e)); });
            $("form input, form select").off("keypress.default-button").on("keypress.default-button", function (e) { return _this.handleDefaultButton(e); });
            $("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']").off("change.pagination-size").on("change.pagination-size", function (e) { return _this.paginationSizeChanged(e); });
            $("[data-sort-item]").parents("tbody").each(function (i, e) { return _this.enableDragSort($(e)); });
            $("a[data-pagination]").off("click.ajax-paging").on("click.ajax-paging", function (e) { return _this.enableAjaxPaging(e); });
            $("a[data-sort]").off("click.ajax-sorting").on("click.ajax-sorting", function (e) { return _this.enableAjaxSorting(e); });
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return _this.adjustIFrameHeightToContents(e.currentTarget); });
            $("th[data-sort]").each(function (i, e) { return _this.setSortHeaderClass($(e)); });
            $("[data-val-number]").off("blur.cleanup-number").on("blur.cleanup-number", function (e) { return _this.cleanUpNumberField($(e.currentTarget)); });
            $("[data-toggle=tab]").off("click.tab-toggle").on("click.tab-toggle", function () { return _this.ensureModalResize(); });
            $("select.form-control").each(function (i, e) { return _this.changeItToChosen($(e)); });
            //$.validator.unobtrusive.parse('form');
            // =================== Plug-ins ====================enableTimeControl
            $("input[autocomplete-source]").each(function (i, e) { return new autoComplete_1.AutoComplete($(e)).handle(); });
            $("[data-control=date-picker],[data-control=calendar]").each(function (i, e) { return new datePicker_1.DatePicker($(e)); });
            $("[data-control='date-picker|time-picker']").each(function (i, e) { return new TimeControl_1.TimeControl($(e)); });
            $("[data-control=time-picker]").each(function (i, e) { return new TimeControl_1.TimeControl($(e)); });
            $("[data-control=date-drop-downs]").each(function (i, e) { return _this.enableDateDropdown($(e)); });
            //$("[data-control=html-editor]").each((i, e) => this.enableHtmlEditor($(e)));
            $("[data-control=numeric-up-down]").each(function (i, e) { return new numericUpDown_1.NumbericUpDown($(e)).enable(); });
            $("[data-control=range-slider],[data-control=slider]").each(function (i, e) { return new slider_1.Slider($(e)).enable(); });
            $(".file-upload input:file").each(function (i, e) { return new FileUpload_1.FileUpload($(e)).enable(); });
            $("[data-confirm-question]").each(function (i, e) { return new ConfirmBox_1.ConfirmBox($(e)).enable(); });
            $(".password-strength").each(function (i, e) { return _this.enablePasswordStengthMeter($(e)); });
            $(".with-submenu").each(function (i, e) { return new subMenu_1.SubMenu($(e)); });
            // =================== Request lifecycle ====================
            $(window).off("popstate.ajax-redirect").on("popstate.ajax-redirect", function (e) { return _this.ajaxRedirectBackClicked(e); });
            $("a[data-redirect=ajax]").off("click.ajax-redirect").on("click.ajax-redirect", function (e) { return _this.enableAjaxRedirect(e); });
            $('form[method=get]').off("submit.clean-up").on("submit.clean-up", function (e) { return _this.cleanGetFormSubmit(e); });
            $("[formaction]").not("[formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return _this.invokeActionWithAjax(e, $(e.currentTarget).attr("formaction")); });
            $("[formaction][formmethod=post]").off("click.formaction").on("click.formaction", function (e) { return _this.invokeActionWithPost(e); });
            $("[data-change-action]").off("change.data-action").on("change.data-action", function (e) { return _this.invokeActionWithAjax(e, $(e.currentTarget).attr("data-change-action")); });
            $("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]").off("dp.change.data-action").on("dp.change.data-action", function (e) { return _this.invokeActionWithAjax(e, $(e.currentTarget).attr("data-change-action")); });
            this.updateSubFormStates();
            this.adjustModalHeight();
            this._initializeActions.forEach(function (action) { return action(); });
        };
        OlivePage.prototype.changeItToChosen = function (selectControl) {
            var options = { disable_search_threshold: 5 };
            selectControl.chosen(options);
        };
        OlivePage.prototype.skipNewWindows = function () {
            // Remove the target attribute from links:
            $(window).off('click.SanityAdapter').on('click.SanityAdapter', function (e) {
                $(e.target).filter('a').removeAttr('target');
            });
            this.openWindow = function (url, target) { return location.replace(url); };
        };
        OlivePage.prototype.enableDragSort = function (container) {
            var _this = this;
            var isTable = container.is("tbody");
            var items = isTable ? "> tr" : "> li"; // TODO: Do we need to support any other markup?
            container.sortable({
                handle: '[data-sort-item]',
                items: items,
                containment: "parent",
                axis: 'y',
                helper: function (e, ui) {
                    // prevent TD collapse during drag
                    ui.children().each(function (i, c) { return $(c).width($(c).width()); });
                    return ui;
                },
                stop: function (e, ui) {
                    var dropBefore = ui.item.next().find("[data-sort-item]").attr("data-sort-item") || "";
                    var handle = ui.item.find("[data-sort-item]");
                    var actionUrl = handle.attr("data-sort-action");
                    actionUrl = Url_1.Url.addQuery(actionUrl, "drop-before", dropBefore);
                    _this.invokeActionWithAjax({ currentTarget: handle.get(0) }, actionUrl);
                }
            });
        };
        OlivePage.prototype.enablePasswordStengthMeter = function (container) {
            // for configuration options : https://github.com/ablanco/jquery.pwstrength.bootstrap/blob/master/OPTIONS.md
            if (container.find(".progress").length !== 0)
                return;
            var formGroup = container.closest(".form-group");
            var options = {
                common: {},
                rules: {},
                ui: {
                    container: formGroup,
                    showVerdictsInsideProgressBar: true,
                    showStatus: true,
                    showPopover: false,
                    showErrors: false,
                    viewports: {
                        progress: container
                    },
                    verdicts: [
                        "<span class='fa fa-exclamation-triangle'></span> Weak",
                        "<span class='fa fa-exclamation-triangle'></span> Normal",
                        "Medium",
                        "<span class='fa fa-thumbs-up'></span> Strong",
                        "<span class='fa fa-thumbs-up'></span> Very Strong"
                    ],
                }
            };
            var password = formGroup.find(":password");
            if (password.length == 0) {
                console.log('Error: no password field found for password strength.');
                console.log(container);
            }
            else
                password.pwstrength(options);
        };
        OlivePage.prototype.ensureModalResize = function () {
            var _this = this;
            setTimeout(function () { return _this.adjustModalHeight(); }, 1);
        };
        OlivePage.prototype.configureValidation = function () {
            var methods = $.validator.methods;
            var format = this.DATE_FORMAT;
            methods.date = function (value, element) {
                if (this.optional(element))
                    return true;
                return moment(value, format).isValid();
            };
            // TODO: datetime, time
        };
        OlivePage.prototype.updateSubFormStates = function () {
            var countItems = function (element) { return $(element).parent().find(".subform-item:visible").length; };
            // Hide removed items
            $("input[name*=MustBeDeleted][value=True]").closest('[data-subform]').hide();
            // hide empty headers
            $(".horizontal-subform thead").each(function (i, e) {
                $(e).css('visibility', (countItems(e) > 0) ? 'visible' : 'hidden');
            });
            // Hide add buttons
            $("[data-subform-max]").each(function (i, e) {
                var show = countItems(e) < parseInt($(e).attr('data-subform-max'));
                $(e).find("[data-add-subform=" + $(e).attr("data-subform") + "]").toggle(show);
            });
            // Hide delete buttons
            $("[data-subform-min]").each(function (i, e) {
                var show = countItems(e) > parseInt($(e).attr('data-subform-min'));
                $(e).find("[data-delete-subform=" + $(e).attr("data-subform") + "]").css('visibility', (show) ? 'visible' : 'hidden');
            });
        };
        OlivePage.prototype.enableDateDropdown = function (input) {
            // TODO: Implement
        };
        OlivePage.prototype.enableSelectAllToggle = function (event) {
            var trigger = $(event.currentTarget);
            trigger.closest("table").find("td.select-row > input:checkbox").prop('checked', trigger.is(":checked"));
        };
        OlivePage.prototype.enableInstantSearch = function (control) {
            // TODO: Make it work with List render mode too.
            control.off("keyup.immediate-filter").on("keyup.immediate-filter", function (event) {
                var keywords = control.val().toLowerCase().split(' ');
                var rows = control.closest('[data-module]').find(".grid > tbody > tr");
                rows.each(function (index, e) {
                    var row = $(e);
                    var content = row.text().toLowerCase();
                    var hasAllKeywords = keywords.filter(function (i) { return content.indexOf(i) == -1; }).length == 0;
                    if (hasAllKeywords)
                        row.show();
                    else
                        row.hide();
                });
            });
            control.on("keydown", function (e) {
                if (e.keyCode == 13)
                    e.preventDefault();
            });
        };
        OlivePage.prototype.validateForm = function (trigger) {
            if (trigger.is("[formnovalidate]"))
                return true;
            var form = trigger.closest("form");
            var validator = form.validate();
            if (!validator.form()) {
                var alertUntyped = alert;
                if (form.is("[data-validation-style*=message-box]"))
                    alertUntyped(validator.errorList.map(function (err) { return err.message; }).join('\r\n'), function () { setTimeout(function () { return validator.focusInvalid(); }, 0); });
                validator.focusInvalid();
                return false;
            }
            return true;
        };
        //enableHtmlEditor(input: any) {
        //    $.getScript(CKEDITOR_BASEPATH + "ckeditor.js", () => {
        //        $.getScript(CKEDITOR_BASEPATH + "adapters/jquery.js", () => {
        //            CKEDITOR.config.contentsCss = CKEDITOR_BASEPATH + 'contents.css';
        //            var editor = CKEDITOR.replace($(input).attr('id'),
        //                {
        //                    toolbar: $(input).attr('data-toolbar') || this.DEFAULT_HTML_EDITOR_MODE,
        //                    customConfig: '/Scripts/ckeditor_config.js'
        //                });
        //            editor.on('change', (evt) => evt.editor.updateElement());
        //            editor.on("instanceReady", (event) => this.adjustModalHeight());
        //        });
        //    });
        //}
        OlivePage.prototype.alertUnobtrusively = function (message, style) {
            alertify.log(message, style);
        };
        OlivePage.prototype.enableAlert = function () {
            var _this = this;
            var w = window;
            w.alert = function (text, callback) { return _this.alert(text, null, callback); };
        };
        OlivePage.prototype.alert = function (text, style, callback) {
            if (text == undefined)
                text = "";
            text = text.trim();
            if (text.indexOf("<") != 0) {
                text = text.replace(/\r/g, "<br />");
                alertify.alert(text, callback, style);
            }
            else {
                alertify.alert('', callback, style);
                $('.alertify-message').empty().append($.parseHTML(text));
            }
        };
        OlivePage.prototype.openLinkModal = function (event) {
            var target = $(event.currentTarget);
            var url = target.attr("href");
            var modalOptions = {};
            var options = target.attr("data-modal-options");
            if (options)
                modalOptions = WindowContext_1.WindowContext.toJson(options);
            this.openModal(url, modalOptions);
            return false;
        };
        OlivePage.prototype.toJson = function (data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                console.log('Cannot parse this data to Json: ');
                console.log(data);
            }
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
                    this.executeActions(WindowContext_1.WindowContext.toJson(action), trigger);
            }
        };
        OlivePage.prototype.canAutoFocus = function (input) {
            return input.attr("data-autofocus") !== "disabled";
        };
        OlivePage.prototype.enableDateControl = function (input) {
            var _this = this;
            if (this.isWindowModal()) {
                input.off("dp.show.adjustHeight").on("dp.show.adjustHeight", function (e) { return _this.adjustModalHeightForDataPicker(e); });
                input.off("dp.hide.adjustHeight").on("dp.hide.adjustHeight", function (e) { return _this.adjustModalHeightForDataPicker(e); });
            }
            input.attr("data-autofocus", "disabled");
            var control = input.attr("data-control");
            var viewMode = input.attr("data-view-mode") || 'days';
            if (control == "date-picker") {
                input.datetimepicker({
                    format: this.DATE_FORMAT,
                    useCurrent: false,
                    showTodayButton: true,
                    icons: { today: 'today' },
                    viewMode: viewMode,
                    keepInvalid: input.closest("form").find("[data-change-action]").length == 0,
                    locale: this.DATE_LOCALE
                }).data("DateTimePicker").keyBinds().clear = null;
                // Now make calendar icon clickable as well             
                input.parent().find(".fa-calendar").parent(".input-group-addon").click(function () { input.focus(); });
            }
            else
                alert("Don't know how to handle date control of " + control);
        };
        OlivePage.prototype.adjustModalHeightForDataPicker = function (e) {
            var datepicker = $(e.currentTarget).siblings('.bootstrap-datetimepicker-widget');
            if (datepicker.length === 0) {
                this.adjustModalHeight();
                return;
            }
            var offset = Math.ceil(datepicker.offset().top + datepicker[0].offsetHeight) - document.body.offsetHeight + 6;
            var overflow = Math.max(offset, 0);
            this.adjustModalHeight(overflow);
        };
        OlivePage.prototype.handleDefaultButton = function (event) {
            if (event.which === 13) {
                var target = $(event.currentTarget);
                var button = target.closest("[data-module]").find('[default-button]:first'); // Same module
                if (button.length == 0)
                    button = $('[default-button]:first'); // anywhere
                button.click();
                return false;
            }
            else
                return true;
        };
        OlivePage.prototype.deleteSubForm = function (event) {
            var button = $(event.currentTarget);
            var container = button.parents(".subform-item");
            container.find("input[name*=MustBeDeleted]").val("true");
            container.hide();
            this.updateSubFormStates();
            event.preventDefault();
        };
        OlivePage.prototype.enableAjaxPaging = function (event) {
            var button = $(event.currentTarget);
            var page = button.attr("data-pagination");
            var key = "p";
            if (page.split('=').length > 1) {
                key = page.split('=')[0];
                page = page.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            input.val(page);
            if (input.val() != page) {
                // Drop down list case
                input.parent().append($("<input type='hidden'/>").attr("name", key).val(page));
                input.remove();
            }
        };
        OlivePage.prototype.enableAjaxSorting = function (event) {
            var button = $(event.currentTarget);
            var sort = button.attr("data-sort");
            var key = "s";
            if (sort.split('=').length > 1) {
                key = sort.split('=')[0];
                sort = sort.split('=')[1];
            }
            var input = $("[name='" + key + "']");
            if (input.val() == sort)
                sort += ".DESC";
            input.val(sort);
        };
        OlivePage.prototype.applyColumns = function (event) {
            var button = $(event.currentTarget);
            var checkboxes = button.closest(".select-cols").find(":checkbox");
            if (checkboxes.length === 0 || checkboxes.filter(":checked").length > 0)
                return;
            $("<input type='checkbox' checked='checked'/>").hide().attr("name", checkboxes.attr("name")).val("-")
                .appendTo(button.parent());
        };
        OlivePage.prototype.enableAjaxRedirect = function (event) {
            if (event.ctrlKey || event.button === 1)
                return true;
            var link = $(event.currentTarget);
            var url = link.attr('href');
            this.ajaxRedirect(url, link);
            return false;
        };
        OlivePage.prototype.ajaxRedirect = function (url, trigger, isBack, keepScroll, addToHistory) {
            var _this = this;
            if (trigger === void 0) { trigger = null; }
            if (isBack === void 0) { isBack = false; }
            if (keepScroll === void 0) { keepScroll = false; }
            if (addToHistory === void 0) { addToHistory = true; }
            this.isAjaxRedirecting = true;
            this.isAwaitingAjaxResponse = true;
            if (window.stop)
                window.stop();
            else if (document.execCommand !== undefined)
                document.execCommand("Stop", false);
            var scrollTopBefore;
            if (keepScroll) {
                scrollTopBefore = $(document).scrollTop();
            }
            this.showPleaseWait();
            $.ajax({
                url: url,
                type: 'GET',
                success: function (response) {
                    _this.events = {};
                    if (!isBack) {
                        _this.ajaxChangedUrl++;
                        if (addToHistory)
                            history.pushState({}, $("#page_meta_title").val(), url);
                    }
                    _this.isAwaitingAjaxResponse = false;
                    _this.isAjaxRedirecting = false;
                    _this.invokeAjaxActionResult(response, null, trigger);
                    if (keepScroll) {
                        $(document).scrollTop(scrollTopBefore);
                    }
                },
                error: function (response) { return location.href = url; },
                complete: function (response) { return WindowContext_1.WindowContext.hidePleaseWait(); }
            });
            return false;
        };
        OlivePage.prototype.ajaxRedirectBackClicked = function (event) {
            if (this.ajaxChangedUrl == 0)
                return;
            this.ajaxChangedUrl--;
            this.ajaxRedirect(location.href, null, true);
        };
        OlivePage.prototype.returnToPreviousPage = function (target) {
            var returnUrl = Url_1.Url.getQuery("ReturnUrl");
            if (returnUrl) {
                if (target && $(target).is("[data-redirect=ajax]"))
                    this.ajaxRedirect(returnUrl, $(target));
                else
                    location.href = returnUrl;
            }
            else
                history.back();
            return false;
        };
        OlivePage.prototype.cleanGetFormSubmit = function (event) {
            var form = $(event.currentTarget);
            if (this.validateForm(form) == false) {
                WindowContext_1.WindowContext.hidePleaseWait();
                return false;
            }
            var formData = Form_1.Form.merge(form.serializeArray()).filter(function (item) { return item.name != "__RequestVerificationToken"; });
            var url = Url_1.Url.removeEmptyQueries(form.attr('action'));
            try {
                form.find("input:checkbox:unchecked").each(function (ind, e) { return url = Url_1.Url.removeQuery(url, $(e).attr("name")); });
                for (var _i = 0, formData_1 = formData; _i < formData_1.length; _i++) {
                    var item = formData_1[_i];
                    url = Url_1.Url.updateQuery(url, item.name, item.value);
                }
                url = Url_1.Url.removeEmptyQueries(url);
                if (form.is("[data-redirect=ajax]"))
                    this.ajaxRedirect(url, form);
                else
                    location.href = url;
            }
            catch (error) {
                console.log(error);
                alert(error);
            }
            return false;
        };
        OlivePage.prototype.enableUserHelp = function (element) {
            element.click(function () { return false; });
            var message = element.attr('data-user-help'); // todo: unescape message and conver to html
            element['popover']({ trigger: 'focus', content: message });
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
            else if (action.BrowserAction == "CloseModal" && this.closeModal() === false)
                return false;
            else if (action.BrowserAction == "CloseModalRefreshParent" && this.closeModal(true) === false)
                return false;
            else if (action.BrowserAction == "Close")
                window.close();
            else if (action.BrowserAction == "Refresh")
                this.refresh();
            else if (action.BrowserAction == "Print")
                window.print();
            else if (action.BrowserAction == "ShowPleaseWait")
                this.showPleaseWait(action.BlockScreen);
            else if (action.ReplaceSource)
                this.replaceListControlSource(action.ReplaceSource, action.Items);
            else if (action.Download)
                this.download(action.Download);
            else if (action.Redirect)
                this.executeRedirectAction(action, trigger);
            else
                alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
            return true;
        };
        OlivePage.prototype.executeNotifyAction = function (action, trigger) {
            if (action.Obstruct == false)
                this.alertUnobtrusively(action.Notify, action.Style);
            else
                this.alert(action.Notify, action.Style);
        };
        OlivePage.prototype.executeRedirectAction = function (action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && this.isWindowModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal(action.Redirect, {});
            else if (action.Target && action.Target != '')
                this.openWindow(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
                this.ajaxRedirect(action.Redirect, trigger);
            else
                location.replace(action.Redirect);
        };
        OlivePage.prototype.replaceListControlSource = function (controlId, items) {
            var $control = $('#' + controlId);
            if ($control.is("select")) {
                $control.empty();
                for (var i = 0; i < items.length; i++) {
                    $control.append($("<option value='" + items[i].Value + "'>" + items[i].Text + "</option>"));
                }
            }
            else {
                console.log("Unable to replace list items");
            }
        };
        OlivePage.prototype.download = function (url) {
            if (this.isWindowModal()) {
                var page = window.parent["page"];
                if (page && page.download) {
                    page.download(url);
                    return;
                }
            }
            $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");
        };
        OlivePage.prototype.openWindow = function (url, target) {
            window.open(url, target);
        };
        OlivePage.prototype.showPleaseWait = function (blockScreen) {
            if (blockScreen === void 0) { blockScreen = false; }
            if (!$(document.forms[0]).valid())
                return;
            var screen = $("<div class='wait-screen' />").appendTo("body");
            if (blockScreen) {
                $("<div class='cover' />")
                    .width(Math.max($(document).width(), $(window).width()))
                    .height(Math.max($(document).height(), $(window).height()))
                    .appendTo(screen);
            }
            $("<div class='wait-container'><div class='wait-box'><img src='/public/img/loading.gif'/></div>")
                .appendTo(screen)
                .fadeIn('slow');
        };
        OlivePage.prototype.getModalTemplate = function (options) {
            var modalDialogStyle = "";
            var iframeStyle = "width:100%; border:0;";
            var iframeAttributes = "";
            if (options) {
                if (options.width) {
                    modalDialogStyle += "width:" + options.width + ";";
                }
                if (options.height) {
                    modalDialogStyle += "height:" + options.height + ";";
                    iframeStyle += "height:" + options.height + ";";
                    iframeAttributes += " data-has-explicit-height='true'";
                }
            }
            return "<div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel'\
 aria-hidden='true'>\
            <div class='modal-dialog' style='" + modalDialogStyle + "'>\
    <div class='modal-content'>\
    <div class='modal-header'>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
            <i class='fa fa-times-circle'></i>\
        </button>\
    </div>\
    <div class='modal-body'>\
        <div class='row text-center'><i class='fa fa-spinner fa-spin fa-2x'></i></div>\
        <iframe style='" + iframeStyle + "' " + iframeAttributes + "></iframe>\
    </div>\
</div></div></div>";
        };
        OlivePage.prototype.openModal = function (url, options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            this.isOpeningModal = true;
            if (this.currentModal != null)
                if (this.closeModal() === false)
                    return false;
            this.currentModal = $(this.getModalTemplate(options));
            if (true /* TODO: Change to if Internet Explorer only */)
                this.currentModal.removeClass("fade");
            var frame = this.currentModal.find("iframe");
            frame.attr("src", url).on("load", function (e) {
                _this.isOpeningModal = false;
                var isHeightProvided = !!(options && options.height);
                if (!isHeightProvided) {
                    var doc = frame.get(0).contentWindow.document;
                    setTimeout(function () { return frame.height(doc.body.offsetHeight); }, 10); // Timeout is used due to an IE bug.
                }
                _this.currentModal.find(".modal-body .text-center").remove();
            });
            this.currentModal.appendTo("body").modal('show');
        };
        OlivePage.prototype.closeModal = function (refreshParent) {
            if (refreshParent === void 0) { refreshParent = false; }
            if (this.raise("modal:closing") === false)
                return false;
            this.isClosingModal = true;
            if (this.currentModal) {
                this.currentModal.modal('hide').remove();
                if (refreshParent)
                    this.refresh();
                this.currentModal = null;
                this.raise("modal:closed");
            }
            else if (window.parent) {
                var p = window.parent;
                if (p.page)
                    if (p.page.closeModal(refreshParent) === false)
                        return false;
            }
            this.isClosingModal = false;
            return true;
        };
        OlivePage.prototype.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").parent().is("body"))
                this.ajaxRedirect(location.href, null, false /*isBack*/, keepScroll, false /*addToHistory:*/);
            else
                location.reload();
        };
        OlivePage.prototype.invokeActionWithAjax = function (event, actionUrl, syncCall) {
            var _this = this;
            if (syncCall === void 0) { syncCall = false; }
            var trigger = $(event.currentTarget);
            var triggerUniqueSelector = trigger.getUniqueSelector();
            var containerModule = trigger.closest("[data-module]");
            if (this.validateForm(trigger) == false) {
                WindowContext_1.WindowContext.hidePleaseWait();
                return false;
            }
            var data_before_disable = WindowContext_1.WindowContext.getPostData(trigger);
            var disableToo = this.DISABLE_BUTTONS_DURING_AJAX && !trigger.is(":disabled");
            if (disableToo)
                trigger.attr('disabled', 'disabled');
            trigger.addClass('loading-action-result');
            this.isAwaitingAjaxResponse = true;
            $.ajax({
                url: actionUrl,
                type: trigger.attr("data-ajax-method") || 'POST',
                async: !syncCall,
                data: data_before_disable,
                success: function (result) { WindowContext_1.WindowContext.hidePleaseWait(); _this.invokeAjaxActionResult(result, containerModule, trigger); },
                error: function (response) { return WindowContext_1.WindowContext.handleAjaxResponseError(response); },
                complete: function (x) {
                    _this.isAwaitingAjaxResponse = false;
                    trigger.removeClass('loading-action-result');
                    if (disableToo)
                        trigger.removeAttr('disabled');
                    var triggerTabIndex = $(":focusable").index($(triggerUniqueSelector));
                    if (triggerTabIndex > -1)
                        $(":focusable").eq(triggerTabIndex + 1).focus();
                }
            });
            return false;
        };
        OlivePage.prototype.enableSelectColumns = function (container) {
            var columns = container.find("div.select-cols");
            container.find("a.select-cols").click(function () { columns.show(); return false; });
            columns.find('.cancel').click(function () { return columns.hide(); });
        };
        OlivePage.prototype.invokeActionWithPost = function (event) {
            var trigger = $(event.currentTarget);
            var containerModule = trigger.closest("[data-module]");
            if (containerModule.is("form") && this.validateForm(trigger) == false)
                return false;
            var data = WindowContext_1.WindowContext.getPostData(trigger);
            var url = trigger.attr("formaction");
            var form = $("<form method='post' />").hide().appendTo($("body"));
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                $("<input type='hidden'/>").attr("name", item.name).val(item.value).appendTo(form);
            }
            form.attr("action", url).submit();
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
                this.reloadValidationRules(trigger.parents("form"));
                this.updateSubFormStates();
                this.initializeUpdatedPage(asElement, trigger);
            }
            else {
                this.executeActions(response, trigger);
                this.initialize();
            }
        };
        OlivePage.prototype.ensureNonModal = function () {
            if (this.isWindowModal())
                parent.window.location.href = location.href;
        };
        OlivePage.prototype.isWindowModal = function () {
            if ($(this.getContainerIFrame()).closest(".modal").length === 0)
                return false;
            return true;
        };
        OlivePage.prototype.getContainerIFrame = function () {
            if (parent == null || parent == self)
                return null;
            return $(parent.document).find("iframe").filter(function (i, f) { return (f.contentDocument || f.contentWindow.document) == document; }).get(0);
        };
        OlivePage.prototype.enableSlider = function (input) {
            var options = { min: 0, max: 100, value: null, range: false, formatter: null, tooltip: 'always', upper: null, tooltip_split: false };
            var data_options = input.attr("data-options") ? JSON.parse(Form_1.Form.cleanJson(input.attr("data-options"))) : null;
            if (data_options)
                $.extend(true, options, data_options);
            options.range = input.attr("data-control") == "range-slider";
            if (options.range) {
                if (options.tooltip_split == false)
                    options.formatter = function (v) { return v[0] + " - " + v[1]; };
                if (input.attr("id").endsWith("Max"))
                    return;
                var maxInput = $('[name="' + input.attr("id").split('.')[0] + "." + options.upper + '\"]');
                if (maxInput.length == 0)
                    maxInput = $('[name="' + options.upper || input.attr("id") + 'Max' + '\"]');
                if (maxInput.length == 0)
                    throw new Error("Upper input was not found for the range slider.");
                options.value = [Number(input.val() || options.min), Number(maxInput.val() || options.max)];
                // Standard SEARCH min and max.														 
                // TODO: Change the following to first detect if we're in a search control context and skip the following otherwise.
                var container = $(input).closest(".group-control");
                if (container.length == 0)
                    container = input.parent();
                container.children().each(function (i, e) { return $(e).hide(); });
                var rangeSlider = $("<input type='text' class='range-slider'/>").attr("id", input.attr("id") + "_slider").appendTo(container);
                rangeSlider.slider(options).on('change', function (ev) { input.val(ev.value.newValue[0]); maxInput.val(ev.value.newValue[1]); }); ///// Updated ***********
            }
            else {
                options.value = Number(input.val() || options.min);
                input.slider(options).on('change', function (ev) { input.val(ev.value.newValue); }); ///// Updated ***********
            }
        };
        OlivePage.prototype.adjustModalHeight = function (overflow) {
            if (this.isWindowModal()) {
                var frame = $(this.getContainerIFrame());
                if (frame.attr("data-has-explicit-height") != 'true')
                    frame.height(document.body.offsetHeight + (overflow || 0));
            }
        };
        OlivePage.prototype.adjustIFrameHeightToContents = function (iframe) {
            $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
        };
        OlivePage.prototype.reloadValidationRules = function (form) {
            form.removeData("validator").removeData("unobtrusiveValidation");
            //$.validator.unobtrusive.parse(form);
        };
        OlivePage.prototype.paginationSizeChanged = function (event) {
            $(event.currentTarget).closest("form").submit();
        };
        OlivePage.prototype.highlightRow = function (element) {
            var target = $(element.closest("tr"));
            target.siblings('tr').removeClass('highlighted');
            target.addClass('highlighted');
        };
        OlivePage.prototype.cleanUpNumberField = function (field) {
            var domElement = field.get(0);
            // var start = domElement.selectionStart;
            // var end = domElement.selectionEnd;
            field.val(field.val().replace(/[^\d.-]/g, ""));
            // domElement.setSelectionRange(start, end);
        };
        OlivePage.prototype.setSortHeaderClass = function (thead) {
            var currentSort = thead.closest("[data-module]").find("#Current-Sort").val() || "";
            if (currentSort == "")
                return;
            var sortKey = thead.attr('data-sort');
            if (sortKey == currentSort && !thead.hasClass('sort-ascending')) {
                thead.addClass("sort-ascending");
                thead.append("<i />");
            }
            else if (currentSort == sortKey + ".DESC" && !thead.hasClass('sort-descending')) {
                thead.addClass("sort-descending");
                thead.append("<i />");
            }
        };
        return OlivePage;
    }());
    exports.OlivePage = OlivePage;
});
//# sourceMappingURL=OlivePage.js.map