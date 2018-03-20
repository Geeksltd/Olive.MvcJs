define(["require", "exports", "olive/config", "olive/components/crossDomainEvent", "olive/mvc/formAction", "olive/mvc/ajaxRedirect", "olive/mvc/standardAction", "olive/components/form", "olive/components/url", "olive/extensions/systemExtensions", "olive/components/modal", "olive/components/validate", "olive/components/sorting", "olive/components/paging", "olive/components/masterDetail", "olive/components/alert", "olive/components/waiting", "olive/components/grid", "olive/plugins/select", "olive/plugins/passwordStength", "olive/plugins/htmlEditor", "olive/plugins/timeControl", "olive/plugins/autoComplete", "olive/plugins/slider", "olive/plugins/datePicker", "olive/plugins/dateTimePicker", "olive/plugins/numericUpDown", "olive/plugins/fileUpload", "olive/plugins/confirmBox", "olive/plugins/subMenu", "olive/plugins/instantSearch", "olive/plugins/dateDropdown", "olive/plugins/userHelp"], function (require, exports, config_1, crossDomainEvent_1, formAction_1, ajaxRedirect_1, standardAction_1, form_1, url_1, systemExtensions_1, modal_1, validate_1, sorting_1, paging_1, masterDetail_1, alert_1, waiting_1, grid_1, select_1, passwordStength_1, htmlEditor_1, timeControl_1, autoComplete_1, slider_1, datePicker_1, dateTimePicker_1, numericUpDown_1, fileUpload_1, confirmBox_1, subMenu_1, instantSearch_1, dateDropdown_1, userHelp_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var OlivePage = (function () {
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
            window["alertify"] = window.require("alertify")();
            formAction_1.default.onViewChanged.handle(function (x) { return _this.onViewChanged(x.container, x.trigger, x.isNewPage); });
            crossDomainEvent_1.default.handle('refresh-page', function (x) { return _this.refresh(); });
        }
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
            form_1.default.enableDefaultButtonKeyPress($("form input, form select"));
            paging_1.default.enableOnSizeChanged($("form[method=get] .pagination-size").find("select[name=p],select[name$='.p']"));
            sorting_1.default.enableDragSort($("[data-sort-item]").parents("tbody"));
            paging_1.default.enableWithAjax($("a[data-pagination]"));
            sorting_1.default.enableAjaxSorting($("a[data-sort]"));
            sorting_1.default.setSortHeaderClass($("th[data-sort]"));
            form_1.default.enablecleanUpNumberField($("[data-val-number]"));
            modal_1.default.enalbeEnsureHeight($("[data-toggle=tab]"));
            select_1.default.enableEnhance($("select.form-control"));
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
            formAction_1.default.enableInvokeWithAjax($("[data-change-action]"), "change.data-action", "change.data-action");
            formAction_1.default.enableInvokeWithAjax($("[data-change-action][data-control=date-picker],[data-change-action][data-control=calendar]"), "dp.change.data-action", "data-change-action");
            masterDetail_1.default.updateSubFormStates();
            modal_1.default.adjustHeight();
            this._initializeActions.forEach(function (action) { return action(); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xpdmVQYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL29saXZlUGFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQW9DQTtRQUtJO1lBQUEsaUJBZ0JDO1lBbkJNLFVBQUssR0FBRyxlQUFLLENBQUM7WUFDZCxZQUFPLEdBQUcsaUJBQU8sQ0FBQztZQW9CekIsdUJBQWtCLEdBQUcsRUFBRSxDQUFDO1lBR3hCLDBCQUFxQixHQUFHLEVBQUUsQ0FBQztZQXBCdkIsMEJBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDOUIsZUFBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBRW5CLENBQUMsQ0FBQztnQkFDRSx5SEFBeUg7Z0JBQ3pILHlFQUF5RTtnQkFDekUsZUFBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNwQixrQkFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNyQixLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCw0QkFBNEI7WUFDNUIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUE2QixNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDNUUsb0JBQVUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsS0FBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUF2RCxDQUF1RCxDQUFDLENBQUM7WUFDOUYsMEJBQWdCLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxVQUFBLENBQUMsSUFBSSxPQUFBLEtBQUksQ0FBQyxPQUFPLEVBQUUsRUFBZCxDQUFjLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBR0QsMEJBQU0sR0FBTixVQUFPLE1BQU0sSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUd2RCw2QkFBUyxHQUFULFVBQVUsTUFBTSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUEsQ0FBQyxDQUFDO1FBRTdELGlDQUFhLEdBQWIsVUFBYyxTQUF3QixFQUFFLE9BQW1CLEVBQUUsT0FBd0I7WUFBdkUsMEJBQUEsRUFBQSxnQkFBd0I7WUFBRSx3QkFBQSxFQUFBLGNBQW1CO1lBQUUsd0JBQUEsRUFBQSxlQUF3QjtZQUNqRix3QkFBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQix3QkFBYyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXRELEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ1YsQ0FBQyxDQUFDLGtEQUFrRCxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzlELEVBQUUsQ0FBQyxDQUFDLGdCQUFNLENBQUMsbUJBQW1CLENBQUM7b0JBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDO1FBQ0wsQ0FBQztRQUVELDhCQUFVLEdBQVY7WUFDSSxJQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7WUFFekQsNkRBQTZEO1lBQzdELGNBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUM1QyxjQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDLENBQUM7WUFDNUQsY0FBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELHNCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7WUFDaEQsY0FBSSxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDL0QsZ0JBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDO1lBQzdHLGlCQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9ELGdCQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDL0MsaUJBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUM3QyxpQkFBTyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQy9DLGNBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ3RELGVBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1lBQ2pELGdCQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDL0Msa0JBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN2Qyx3QkFBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBRTdELENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsRUFDOUUsVUFBQyxDQUFNLElBQUssT0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFuRixDQUFtRixDQUFDLENBQUM7WUFFckcsd0NBQXdDO1lBRXhDLG9EQUFvRDtZQUNwRCx1QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO1lBQ2hELHNCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDckQsb0JBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9EQUFvRCxDQUFDLENBQUMsQ0FBQztZQUMzRSx3QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLHFCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7WUFDcEQsc0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1lBQ25ELHVCQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDM0QsZ0JBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG1EQUFtRCxDQUFDLENBQUMsQ0FBQztZQUN0RSxvQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO1lBQ2hELG9CQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7WUFDaEQseUJBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNoRCxpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUVuQyw2REFBNkQ7WUFDN0Qsc0JBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkMsc0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztZQUN4RCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUNqRCxvQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM5RyxvQkFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFDcEUsb0JBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ3ZHLG9CQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLDRGQUE0RixDQUFDLEVBQUUsdUJBQXVCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUVoTCxzQkFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDbkMsZUFBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBRXJCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNLElBQUssT0FBQSxNQUFNLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsMEJBQU0sR0FBTixVQUFPLE1BQU07WUFDVCxJQUFJLFNBQVMsR0FBRyxhQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2dCQUM1RCxzQkFBWSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBSTtnQkFBQyxhQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbEIsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRUQsMkJBQU8sR0FBUCxVQUFRLFVBQWtCO1lBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1lBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLHNCQUFZLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlFLElBQUk7Z0JBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRXZCLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztRQUNMLGdCQUFDO0lBQUQsQ0FBQyxBQWhIRCxJQWdIQyJ9