// import Alert from 'olive/components/alert'
// import Select from 'olive/plugins/select'
// import Waiting from 'olive/components/waiting'
// import { ModalHelper } from '../components/modal'
// import AjaxRedirect from 'olive/mvc/ajaxRedirect'
// import CrossDomainEvent from 'olive/components/crossDomainEvent'
// import Form from 'olive/components/form'
// import FormAction from './formAction';
// export default class StandardAction implements IService {
//     constructor(private alert: Alert,
//         private form: Form,
//         private formAction: FormAction,
//         private waiting: Waiting,
//         private ajaxRedirect: AjaxRedirect,
//         private select: Select,
//         private modalHelper: ModalHelper) { }
//     public enableLinkModal_sa(selector: JQuery) {
//         selector.off("click.open-modal").on("click.open-modal", (e) => {
//             if ($(e.currentTarget).attr("data-mode") === "iframe") {
//                 this.openModaliFrame_sa(e);
//             }
//             else {
//                 this.openModal_sa(e);
//             }
//             return false;
//         });
//     }
//     public runStartup_sa(container: JQuery = null, trigger: any = null, stage: string = "Init") {
//         if (container == null) container = $(document);
//         if (trigger == null) trigger = $(document);
//         let actions = [];
//         $("input[name='Startup.Actions']", container).each((index, item) => {
//             let action = $(item).val();
//             if (actions.indexOf(action) === -1) {
//                 //sometimes, we have a duplicate route in the action string, so we should remove them manually.
//                 let names = action.trimStart("[{").trimEnd("}]").split("},{");
//                 let uniqueNames = [];
//                 $.each(names, (i, el) => {
//                     if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
//                 });
//                 let stringResult = "[{";
//                 $.each(uniqueNames, (i, itm) => {
//                     stringResult += itm + "},{";
//                 });
//                 stringResult = stringResult.trimEnd(",{") + "]";
//                 actions.push(stringResult);
//             }
//         });
//         for (let action of actions) {
//             if (action && (action.Stage || "Init") == stage) this.runAll_sa(JSON.safeParse(action), trigger);
//         }
//     }
//     public runAll_sa(actions: any, trigger: any = null) {
//         for (let action of actions) {
//             if (!this.run_sa(action, trigger)) return;
//         }
//     }
//     private run_sa(action: any, trigger: any): boolean {
//         if (action.Notify || action.Notify == "") this.notify_sa(action, trigger);
//         else if (action.Script) eval(action.Script);
//         else if (action.BrowserAction == "Back") window.history.back();
//         else if (action.BrowserAction == "CloseModal") { if (window.page.modal.closeMe() === false) return false; }
//         else if (action.BrowserAction == "CloseModalRebindParent") {
//             let opener = this.modalHelper.currentModal.opener;
//             if (window.page.modal.closeMe() === false) return false;
//             if (opener) {
//                 let data = this.form.getPostData(opener.parents('form'));
//                 $.post(window.location.href, data, (response) => {
//                     this.formAction.processAjaxResponse_fa(response, opener.closest("[data-module]"), opener, null);
//                 });
//             }
//             else {
//                 CrossDomainEvent.raise(parent, 'refresh-page');
//             }
//         }
//         else if (action.BrowserAction == "CloseModalRefreshParent") {
//             window.page.modal.closeMe();
//             CrossDomainEvent.raise(parent, 'refresh-page');
//         }
//         else if (action.BrowserAction == "Close") window.close();
//         else if (action.BrowserAction == "Refresh") window.page.refresh();
//         else if (action.BrowserAction == "Print") window.print();
//         else if (action.BrowserAction == "ShowPleaseWait") this.waiting.show(action.BlockScreen);
//         else if (action.ReplaceSource) this.select.replaceSource(action.ReplaceSource, action.Items);
//         else if (action.Download) window.download(action.Download);
//         else if (action.Redirect) this.redirect_sa(action, trigger);
//         else alert("Don't know how to handle: " + JSON.stringify(action).htmlEncode());
//         return true;
//     }
//     private notify_sa(action: any, trigger: any) {
//         if (action.Obstruct == false)
//             this.alert.alertUnobtrusively(action.Notify, action.Style);
//         else this.alert.alert(action.Notify, action.Style);
//     }
//     private redirect_sa(action: any, trigger: any) {
//         if (action.Redirect.indexOf('/') != 0 && action.Redirect.indexOf('http') != 0)
//             action.Redirect = '/' + action.Redirect;
//         if (action.OutOfModal && window.isModal()) parent.window.location.href = action.Redirect;
//         else if (action.Target == '$modal') this.openModal_sa({ currentTarget: trigger }, action.Redirect, null);
//         else if (action.Target && action.Target != '') window.open(action.Redirect, action.Target);
//         else if (action.WithAjax === false) location.replace(action.Redirect);
//         else if ((trigger && trigger.is("[data-redirect=ajax]")) || action.WithAjax == true)
//             this.ajaxRedirect.go_ar(action.Redirect, trigger, false, false, true);
//         else location.replace(action.Redirect);
//     }
//     private openModal_sa(event, url?, options?): any {
//         this.modalHelper.close();
//         this.modalHelper.open(event, url, options);
//     }
//     private openModaliFrame_sa(event, url?, options?): void {
//         this.modalHelper.close();
//         this.modalHelper.openiFrame(event, url, options);
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmRBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbXZjL3N0YW5kYXJkQWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDZDQUE2QztBQUM3Qyw0Q0FBNEM7QUFDNUMsaURBQWlEO0FBQ2pELG9EQUFvRDtBQUNwRCxvREFBb0Q7QUFDcEQsbUVBQW1FO0FBQ25FLDJDQUEyQztBQUMzQyx5Q0FBeUM7QUFFekMsNERBQTREO0FBRTVELHdDQUF3QztBQUN4Qyw4QkFBOEI7QUFDOUIsMENBQTBDO0FBQzFDLG9DQUFvQztBQUNwQyw4Q0FBOEM7QUFDOUMsa0NBQWtDO0FBQ2xDLGdEQUFnRDtBQUVoRCxvREFBb0Q7QUFDcEQsMkVBQTJFO0FBQzNFLHVFQUF1RTtBQUN2RSw4Q0FBOEM7QUFDOUMsZ0JBQWdCO0FBQ2hCLHFCQUFxQjtBQUNyQix3Q0FBd0M7QUFDeEMsZ0JBQWdCO0FBRWhCLDRCQUE0QjtBQUM1QixjQUFjO0FBQ2QsUUFBUTtBQUVSLG9HQUFvRztBQUNwRywwREFBMEQ7QUFDMUQsc0RBQXNEO0FBQ3RELDRCQUE0QjtBQUM1QixnRkFBZ0Y7QUFDaEYsMENBQTBDO0FBQzFDLG9EQUFvRDtBQUNwRCxrSEFBa0g7QUFDbEgsaUZBQWlGO0FBQ2pGLHdDQUF3QztBQUN4Qyw2Q0FBNkM7QUFDN0MsbUZBQW1GO0FBQ25GLHNCQUFzQjtBQUN0QiwyQ0FBMkM7QUFDM0Msb0RBQW9EO0FBQ3BELG1EQUFtRDtBQUNuRCxzQkFBc0I7QUFDdEIsbUVBQW1FO0FBQ25FLDhDQUE4QztBQUM5QyxnQkFBZ0I7QUFFaEIsY0FBYztBQUVkLHdDQUF3QztBQUN4QyxnSEFBZ0g7QUFDaEgsWUFBWTtBQUNaLFFBQVE7QUFFUiw0REFBNEQ7QUFDNUQsd0NBQXdDO0FBQ3hDLHlEQUF5RDtBQUN6RCxZQUFZO0FBQ1osUUFBUTtBQUVSLDJEQUEyRDtBQUMzRCxxRkFBcUY7QUFDckYsdURBQXVEO0FBQ3ZELDBFQUEwRTtBQUMxRSxzSEFBc0g7QUFDdEgsdUVBQXVFO0FBQ3ZFLGlFQUFpRTtBQUNqRSx1RUFBdUU7QUFDdkUsNEJBQTRCO0FBQzVCLDRFQUE0RTtBQUM1RSxxRUFBcUU7QUFDckUsdUhBQXVIO0FBQ3ZILHNCQUFzQjtBQUN0QixnQkFBZ0I7QUFDaEIscUJBQXFCO0FBQ3JCLGtFQUFrRTtBQUNsRSxnQkFBZ0I7QUFDaEIsWUFBWTtBQUNaLHdFQUF3RTtBQUN4RSwyQ0FBMkM7QUFDM0MsOERBQThEO0FBQzlELFlBQVk7QUFDWixvRUFBb0U7QUFDcEUsNkVBQTZFO0FBQzdFLG9FQUFvRTtBQUNwRSxvR0FBb0c7QUFDcEcsd0dBQXdHO0FBQ3hHLHNFQUFzRTtBQUN0RSx1RUFBdUU7QUFDdkUsMEZBQTBGO0FBRTFGLHVCQUF1QjtBQUN2QixRQUFRO0FBRVIscURBQXFEO0FBQ3JELHdDQUF3QztBQUN4QywwRUFBMEU7QUFDMUUsOERBQThEO0FBQzlELFFBQVE7QUFFUix1REFBdUQ7QUFDdkQseUZBQXlGO0FBQ3pGLHVEQUF1RDtBQUV2RCxvR0FBb0c7QUFDcEcsb0hBQW9IO0FBQ3BILHNHQUFzRztBQUN0RyxpRkFBaUY7QUFDakYsK0ZBQStGO0FBQy9GLHFGQUFxRjtBQUNyRixrREFBa0Q7QUFDbEQsUUFBUTtBQUVSLHlEQUF5RDtBQUN6RCxvQ0FBb0M7QUFDcEMsc0RBQXNEO0FBQ3RELFFBQVE7QUFFUixnRUFBZ0U7QUFDaEUsb0NBQW9DO0FBQ3BDLDREQUE0RDtBQUM1RCxRQUFRO0FBQ1IsSUFBSSJ9