define(["require", "exports", "olive/Components/Alert", "olive/Plugins/Select", "olive/Components/Waiting", "olive/Components/Modal", "olive/Mvc/AjaxRedirect"], function (require, exports, Alert_1, Select_1, Waiting_1, Modal_1, AjaxRedirect_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var StandardAction = /** @class */ (function () {
        function StandardAction() {
        }
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
                Waiting_1.default.show(action.BlockScreen);
            else if (action.ReplaceSource)
                Select_1.default.replaceSource(action.ReplaceSource, action.Items);
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
                Alert_1.default.alertUnobtrusively(action.Notify, action.Style);
            else
                Alert_1.default.alert(action.Notify, action.Style);
        };
        StandardAction.redirect = function (action, trigger) {
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
                AjaxRedirect_1.default.go(action.Redirect, trigger, false, false, true);
            else
                location.replace(action.Redirect);
        };
        StandardAction.refresh = function (keepScroll) {
            if (keepScroll === void 0) { keepScroll = false; }
            if ($("main").parent().is("body"))
                AjaxRedirect_1.default.go(location.href, null, false /*isBack*/, keepScroll, false);
            else
                location.reload();
            return false;
        };
        StandardAction.openModal = function (event, url, options) {
            if (this.modal) {
                this.modal.close();
                this.modal = false;
            }
            this.modal = new Modal_1.default(event, url, options);
            this.modal.open();
        };
        StandardAction.modal = null;
        return StandardAction;
    }());
    exports.default = StandardAction;
});
//# sourceMappingURL=StandardAction.js.map