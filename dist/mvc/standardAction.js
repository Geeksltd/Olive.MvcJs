define(["require", "exports", "olive/components/alert", "olive/plugins/select", "olive/components/waiting", "olive/components/modal", "olive/mvc/ajaxRedirect", "olive/components/crossDomainEvent"], function (require, exports, alert_1, select_1, waiting_1, modal_1, ajaxRedirect_1, crossDomainEvent_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var StandardAction = /** @class */ (function () {
        function StandardAction() {
        }
        StandardAction.enableLinkModal = function (selector) {
            var _this = this;
            selector.off("click.open-modal").on("click.open-modal", function (e) {
                if ($(e.currentTarget).attr("data-mode") === "iframe") {
                    _this.openModaliFrame(e);
                }
                else {
                    _this.openModal(e);
                }
                return false;
            });
        };
        StandardAction.runStartup = function (container, trigger, stage) {
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
                    this.runAll(JSON.safeParse(action), trigger);
            }
        };
        StandardAction.runAll = function (actions, trigger) {
            if (trigger === void 0) { trigger = null; }
            for (var _i = 0, actions_2 = actions; _i < actions_2.length; _i++) {
                var action = actions_2[_i];
                if (!this.run(action, trigger))
                    return;
            }
        };
        StandardAction.run = function (action, trigger) {
            if (action.Notify || action.Notify == "")
                this.notify(action, trigger);
            else if (action.Script)
                eval(action.Script);
            else if (action.BrowserAction == "Back")
                window.history.back();
            else if (action.BrowserAction == "CloseModal") {
                if (window.page.modal.closeMe() === false)
                    return false;
            }
            else if (action.BrowserAction == "CloseModalRefreshParent") {
                window.page.modal.closeMe();
                crossDomainEvent_1.default.raise(parent, 'refresh-page');
            }
            else if (action.BrowserAction == "Close")
                window.close();
            else if (action.BrowserAction == "Refresh")
                window.page.refresh();
            else if (action.BrowserAction == "Print")
                window.print();
            else if (action.BrowserAction == "ShowPleaseWait")
                waiting_1.default.show(action.BlockScreen);
            else if (action.ReplaceSource)
                select_1.default.replaceSource(action.ReplaceSource, action.Items);
            else if (action.Download)
                window.download(action.Download);
            else if (action.Redirect)
                this.redirect(action, trigger);
            else
                alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
            return true;
        };
        StandardAction.notify = function (action, trigger) {
            if (action.Obstruct == false)
                alert_1.default.alertUnobtrusively(action.Notify, action.Style);
            else
                alert_1.default.alert(action.Notify, action.Style);
        };
        StandardAction.redirect = function (action, trigger) {
            if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
                action.Redirect = '/' + action.Redirect;
            if (action.OutOfModal && window.isModal())
                parent.window.location.href = action.Redirect;
            else if (action.Target == '$modal')
                this.openModal({ currentTarget: trigger }, action.Redirect, null);
            else if (action.Target && action.Target != '')
                window.open(action.Redirect, action.Target);
            else if (action.WithAjax === false)
                location.replace(action.Redirect);
            else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
                ajaxRedirect_1.default.go(action.Redirect, trigger, false, false, true);
            else
                location.replace(action.Redirect);
        };
        StandardAction.openModal = function (event, url, options) {
            modal_1.default.close();
            new modal_1.default(event, url, options).open();
        };
        StandardAction.openModaliFrame = function (event, url, options) {
            modal_1.default.close();
            new modal_1.default(event, url, options).openiFrame();
        };
        return StandardAction;
    }());
    exports.default = StandardAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmRBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbXZjL3N0YW5kYXJkQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBT0E7UUFBQTtRQXFGQSxDQUFDO1FBbkZpQiw4QkFBZSxHQUE3QixVQUE4QixRQUFnQjtZQUE5QyxpQkFXQztZQVZHLFFBQVEsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsVUFBQyxDQUFDO2dCQUN0RCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUNwRCxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDO29CQUNGLEtBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLENBQUM7Z0JBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUNqQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFFYSx5QkFBVSxHQUF4QixVQUF5QixTQUF3QixFQUFFLE9BQW1CLEVBQUUsS0FBc0I7WUFBckUsMEJBQUEsRUFBQSxnQkFBd0I7WUFBRSx3QkFBQSxFQUFBLGNBQW1CO1lBQUUsc0JBQUEsRUFBQSxjQUFzQjtZQUMxRixFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO2dCQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQztnQkFBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztZQUNqQixDQUFDLENBQUMsK0JBQStCLEVBQUUsU0FBUyxD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