define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/formAction", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/globalSearch", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp"], function (require, exports, config_1, crossDomainEvent_1, formAction_1, ajaxRedirect_1, standardAction_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, globalSearch_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1) {
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
            try {
                this.initialize();
            }
            catch (error) {
                alert("initialization failed: " + error);
            }
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
            grid_1.default.mergeActionButtons();
            grid_1.default.enableColumn($(".select-cols .apply"));
            grid_1.default.enableSelectCol($(".select-grid-cols .group-control"));
            grid_1.default.enableToggle($("th.select-all > input:checkbox"));
            masterDetail_1.default.enable($("[data-delete-subform]"));
            paging_1.default.enableOnSizeChanged($("form .pagination-size").find("select[name=p],select[name$='.p']"));
            sorting_1.default.enableDragSort($("[data-sort-item]").parents("tbody,.r-grid-body"));
            paging_1.default.enableWithAjax($("a[data-pagination]"));
            sorting_1.default.enableAjaxSorting($("a[data-sort]"));
            sorting_1.default.setSortHeaderClass($("th[data-sort]"));
            form_1.default.enablecleanUpNumberField($("[data-val-number]"));
            modal_1.default.enableEnsureHeight($("[data-toggle=tab]"));
            select_1.default.enableEnhance($("select"));
            form_1.default.enableDefaultButtonKeyPress($("form input, form select"));
            userHelp_1.default.enable($("[data-user-help]"));
            standardAction_1.default.enableLinkModal($("[target='$modal'][href]"));
            $("iframe[data-adjust-height=true]").off("load.auto-adjust").on("load.auto-adjust", function (e) { return $(e.currentTarget).height(e.currentTarget.contentWindow.document.body.scrollHeight); });
            // =================== Plug-ins ====================
            instantSearch_1.default.enable($("[name=InstantSearch]"));
            autoComplete_1.default.enable($("input[autocomplete-source]"));
            globalSearch_1.default.enable($("input[data-search-source]"));
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
            subMenu_1.default.createAccordion($("ul.accordion"));
            // =================== Request lifecycle ====================
            ajaxRedirect_1.default.enableBack($(window));
            ajaxRedirect_1.default.enableRedirect($("a[data-redirect=ajax]"));
            form_1.default.enablesubmitCleanGet($('form[method=get]'));
            formAction_1.default.enableInvokeWithAjax($("[formaction]").not("[formmethod=post]"), "click.formaction", "formaction");
            formAction_1.default.enableinvokeWithPost($("[formaction][formmethod=post]"));
            formAction_1.default.enableInvokeWithAjax($("[data-change-action]:not([autocomplete-source])"), "change.data-action", "data-change-action");
            formAction_1.default.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]"), "dp.change.data-action", "data-change-action");
            masterDetail_1.default.updateSubFormStates();
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
            if ($("main").length == 1 || $("main").length === 2) //if there is an ajax modal available, then we have 2 main elements.
                ajaxRedirect_1.default.go(location.href, null, false /*isBack*/, keepScroll, false);
            else
                location.reload();
            return false;
        };
        return OlivePage;
    }());
    exports.default = OlivePage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQXFDQTtRQUtJO1lBQUEsaUJBZ0JDO1lBbkJNLFVBQUssR0FBRyxlQUFLLENBQUM7WUFDZCxZQUFPLEdBQUcsaUJBQU8sQ0FBQztZQXlCekIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1lBR3hCLDBCQUFxQixHQUFHLEVBQUUsQ0FBQztZQXpCdkIsMEJBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUIsZUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRW5CLENBQUMsQ0FBQztnQkFDRSx5SEFBeUg7Z0JBQ3pILHlFQUF5RTtnQkFDekUsZUFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixrQkFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQixLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCw0QkFBNEI7WUFDNUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3RCLG9CQUFVLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBdkQsQ0FBdUQsQ0FBQyxDQUFDO1lBQzlGLDBCQUFnQixDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsT0FBTyxFQUFFLEVBQWQsQ0FBYyxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUVELGtDQUFjLEdBQWQ7WUFDSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVztnQkFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQzdELE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBNkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ2hGLENBQUM7UUFHRCwwQkFBTSxHQUFOLFVBQU8sTUFBTSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBR3ZELDZCQUFTLEdBQVQsVUFBVSxNQUFNLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQSxDQUFDLENBQUM7UUFFN0QsaUNBQWEsR0FBYixVQUFjLFNBQXdCLEVBQUUsT0FBbUIsRUFBRSxPQUF3QjtZQUF2RSwwQkFBQSxFQUFBLGdCQUF3QjtZQUFFLHdCQUFBLEVBQUEsY0FBbUI7WUFBRSx3QkFBQSxFQUFBLGVBQXdCO1lBRWpGLHdCQUFjLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDekQsSUFBSTtnQkFDQSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7YUFDckI7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDWixLQUFLLENBQUMseUJBQXlCLEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDNUM7WUFDRCx3QkFBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRELElBQUksT0FBTyxFQUFFO2dCQUNULENBQUMsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM5RCxJQUFJLGdCQUFNLENBQUMsbUJBQW1CO29CQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUQ7UUFDTCxDQUFDO1FBRUQsOEJBQVUsR0FBVjtZQUNJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQztZQUV6RCw2REFBNkQ7WUFDN0QsY0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDMUIsY0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1lBQzVDLGNBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxjQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDdkQsc0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUNoRCxnQkFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7WUFDakcsaUJBQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUM1RSxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQy9DLGlCQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsaUJBQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUMvQyxjQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUN0RCxlQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztZQUNqRCxnQkFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNsQyxjQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUMvRCxrQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLHdCQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFFN0QsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUM5RSxVQUFDLENBQU0sSUFBSyxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQW5GLENBQW1GLENBQUMsQ0FBQztZQUVyRyxvREFBb0Q7WUFDcEQsdUJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztZQUNoRCxzQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ3JELHNCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7WUFDcEQsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztZQUMzRSx3QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLHFCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDcEQsc0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ25ELHVCQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDM0QsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG1EQUFtRCxDQUFDLENBQUMsQ0FBQztZQUN0RSxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ2hELG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDaEQseUJBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoRCxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNuQyxpQkFBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUUzQyw2REFBNkQ7WUFDN0Qsc0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkMsc0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUN4RCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRCxvQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM5RyxvQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFDcEUsb0JBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsaURBQWlELENBQUMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ2xJLG9CQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLDRGQUE0RixDQUFDLEVBQUUsdUJBQXVCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUVoTCxzQkFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDbkMsZUFBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXJCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQztZQUV0RCxNQUFNLENBQUMsa0JBQWtCLENBQUMsR0FBRyxJQUFJLENBQUM7WUFFbEMsSUFBSTtnQkFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7YUFBRTtZQUM5QyxPQUFPLEtBQUssRUFBRTtnQkFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQUU7UUFDM0MsQ0FBQztRQUVELDBCQUFNLEdBQU4sVUFBTyxNQUFNO1lBQ1QsSUFBSSxTQUFTLEdBQUcsYUFBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUUxQyxJQUFJLFNBQVMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQztnQkFDM0Qsc0JBQVksQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztnQkFDekQsYUFBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWxCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFFRCwyQkFBTyxHQUFQLFVBQVEsVUFBa0I7WUFBbEIsMkJBQUEsRUFBQSxrQkFBa0I7WUFDdEIsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxvRUFBb0U7Z0JBQ3JILHNCQUFZLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDOztnQkFDekUsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXZCLE9BQU8sS0FBSyxDQUFDO1FBQ2pCLENBQUM7UUFDTCxnQkFBQztJQUFELENBQUMsQUFoSUQsSUFnSUMifQ==