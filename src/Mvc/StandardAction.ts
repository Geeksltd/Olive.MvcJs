import Alert from 'olive/Components/Alert'
import Select from 'olive/Plugins/Select'
import Waiting from 'olive/Components/Waiting'
import Modal from 'olive/Components/Modal'
import AjaxRedirect from 'olive/Mvc/AjaxRedirect'

export default class StandardAction {
    
    public static enableLinkModal(selector:JQuery){selector.off("click.open-modal").on("click.open-modal", (e) =>{this.openModal(e); return false;})}
    
    public static runStartup(container: JQuery = null, trigger: any = null, stage: string = "Init") {
        if (container == null) container = $(document);
        if (trigger == null) trigger = $(document);
        let actions = [];
        $("input[name='Startup.Actions']", container).each((index, item) => {
            let action = $(item).val();
            if (actions.indexOf(action) === -1)
                actions.push(action);
        });

        for (let action of actions) {
            if (action && (action.Stage || "Init") == stage) this.runAll(JSON.safeParse(action), trigger);
        }
    }

    public static runAll(actions: any, trigger: any = null) {
        for (let action of actions) {
            if (!this.run(action, trigger)) return;
        }
    }

    static run(action: any, trigger: any): boolean {
        if (action.Notify || action.Notify == "") this.notify(action, trigger);
        else if (action.Script) eval(action.Script);
        else if (action.BrowserAction == "Back") window.history.back();
        else if (action.BrowserAction == "CloseModal" && Modal.close() === false) return false;
        else if (action.BrowserAction == "CloseModalRefreshParent") return this.refresh();
        else if (action.BrowserAction == "Close") window.close();
        else if (action.BrowserAction == "Refresh") this.refresh();
        else if (action.BrowserAction == "Print") window.print();
        else if (action.BrowserAction == "ShowPleaseWait") Waiting.show(action.BlockScreen);
        else if (action.ReplaceSource) Select.replaceSource(action.ReplaceSource, action.Items);
        else if (action.Download) window.download(action.Download);
        else if (action.Redirect) this.redirect(action, trigger);
        else alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());

        return true;
    }

    static notify(action: any, trigger: any) {
        if (action.Obstruct == false)
            Alert.alertUnobtrusively(action.Notify, action.Style);
        else Alert.alert(action.Notify, action.Style);
    }

    static redirect(action: any, trigger: any) {
        if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0) action.Redirect = '/' + action.Redirect;

        if (action.OutOfModal && window.isModal()) parent.window.location.href = action.Redirect;
        else if (action.Target == '$modal') this.openModal(null, action.Redirect, {});
        else if (action.Target && action.Target != '') window.open(action.Redirect, action.Target);
        else if (action.WithAjax === false) location.replace(action.Redirect);
        else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
            AjaxRedirect.go(action.Redirect, trigger, false, false, true);
        else location.replace(action.Redirect);
    }

    static refresh(keepScroll = false) {
        if ($("main").parent().is("body"))
            AjaxRedirect.go(location.href, null, false /*isBack*/, keepScroll, false);
        else location.reload();

        return false;
    }

    static openModal(event, url?, options?) {
        Modal.close();
        new Modal(event, url, options).open();
    }
}
