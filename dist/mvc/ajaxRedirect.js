// import Waiting from 'olive/components/waiting'
// import Url from 'olive/components/url'
// import FormAction from 'olive/mvc/formAction'
// import { ModalHelper } from 'olive/components/modal';
// export default class AjaxRedirect implements IService {
//     private requestCounter_ar = 0;
//     private ajaxChangedUrl_ar = 0;
//     private isAjaxRedirecting_ar = false;
//     public onRedirected_ar: ((title: string, url: string) => void) = this.defaultOnRedirected_ar;
//     public onRedirectionFailed_ar: ((url: string, response: JQueryXHR) => void) = this.defaultOnRedirectionFailed_ar;
//     constructor(
//         private url: Url,
//         private formAction: FormAction,
//         private waiting: Waiting,
//         private modalHelper: ModalHelper
//     ) { }
//     public defaultOnRedirected_ar(title: string, url: string) {
//         history.pushState({}, title, url);
//     }
//     public defaultOnRedirectionFailed_ar(url: string, response: JQueryXHR) {
//         if (confirm("Request failed. Do you want to see the error details?"))
//             open(url, "_blank");
//     }
//     public enableBack_ar(selector: JQuery) {
//         selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", e => this.back_ar(e));
//     }
//     public enableRedirect_ar(selector: JQuery) {
//         selector.off("click.ajax-redirect").on("click.ajax-redirect", e => this.redirect_ar(e));
//     }
//     private redirect_ar(event: JQueryEventObject) {
//         if (event.ctrlKey || event.button === 1) return true;
//         let link = $(event.currentTarget);
//         let url = link.attr('href');
//         this.go_ar(url, link, false, false, true);
//         return false;
//     }
//     private back_ar(event) {
//         if (this.modalHelper.isOrGoingToBeModal())
//             window.location.reload();
//         else {
//             if (this.ajaxChangedUrl_ar == 0) return;
//             this.ajaxChangedUrl_ar--;
//             this.go_ar(location.href, null, true, false, false);
//         }
//     }
//     public go_ar(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false,
//         addToHistory = true) {
//         if (!trigger) trigger = $(window);
//         url = this.url.effectiveUrlProvider(url, trigger);
//         if (url.indexOf(this.url.baseContentUrl + "/##") == 0) {
//             url = url.substring(this.url.baseContentUrl.length).substring(3);
//             console.log("## Redirecting to " + url);
//         }
//         this.isAjaxRedirecting_ar = true;
//         this.formAction.isAwaitingAjaxResponse_fa = true;
//         const requestCounter = ++this.requestCounter_ar;
//         if (window.stop) window.stop();
//         else if (document.execCommand !== undefined) document.execCommand("Stop", false);
//         let scrollTopBefore;
//         if (keepScroll) {
//             scrollTopBefore = $(document).scrollTop();
//         }
//         this.waiting.show(false, false);
//         $.ajax({
//             url: url,
//             type: 'GET',
//             xhrFields: { withCredentials: true },
//             success: (response) => {
//                 this.formAction.events_fa = {};
//                 if (!isBack) {
//                     this.ajaxChangedUrl_ar++;
//                     if (addToHistory && !window.isModal()) {
//                         var title = $("#page_meta_title").val();
//                         let addressBar = trigger.attr("data-addressbar") || url;
//                         try {
//                             this.onRedirected_ar(title, addressBar);
//                         } catch (error) {
//                             addressBar = this.url.makeAbsolute(this.url.baseContentUrl, "/##" + addressBar);
//                             history.pushState({}, title, addressBar);
//                         }
//                     }
//                 }
//                 if (addToHistory) {
//                     if (window.isModal() && addToHistory) this.modalHelper.changeUrl(url);
//                 }
//                 this.formAction.isAwaitingAjaxResponse_fa = false;
//                 this.isAjaxRedirecting_ar = false;
//                 this.formAction.processAjaxResponse_fa(response, null, trigger, isBack ? "back" : null);
//                 if (keepScroll) $(document).scrollTop(scrollTopBefore);
//             },
//             error: (response) => {
//                 if (this.requestCounter_ar == requestCounter)
//                     this.onRedirectionFailed_ar(url, response);
//             },
//             complete: (response) => this.waiting.hide()
//         });
//         return false;
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWpheFJlZGlyZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL212Yy9hamF4UmVkaXJlY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHlDQUF5QztBQUN6QyxnREFBZ0Q7QUFDaEQsd0RBQXdEO0FBRXhELDBEQUEwRDtBQUMxRCxxQ0FBcUM7QUFDckMscUNBQXFDO0FBQ3JDLDRDQUE0QztBQUM1QyxvR0FBb0c7QUFDcEcsd0hBQXdIO0FBRXhILG1CQUFtQjtBQUNuQiw0QkFBNEI7QUFDNUIsMENBQTBDO0FBQzFDLG9DQUFvQztBQUNwQywyQ0FBMkM7QUFDM0MsWUFBWTtBQUVaLGtFQUFrRTtBQUNsRSw2Q0FBNkM7QUFDN0MsUUFBUTtBQUVSLCtFQUErRTtBQUMvRSxnRkFBZ0Y7QUFDaEYsbUNBQW1DO0FBQ25DLFFBQVE7QUFFUiwrQ0FBK0M7QUFDL0MscUdBQXFHO0FBQ3JHLFFBQVE7QUFFUixtREFBbUQ7QUFDbkQsbUdBQW1HO0FBQ25HLFFBQVE7QUFFUixzREFBc0Q7QUFDdEQsZ0VBQWdFO0FBQ2hFLDZDQUE2QztBQUM3Qyx1Q0FBdUM7QUFDdkMscURBQXFEO0FBQ3JELHdCQUF3QjtBQUN4QixRQUFRO0FBRVIsK0JBQStCO0FBQy9CLHFEQUFxRDtBQUNyRCx3Q0FBd0M7QUFDeEMsaUJBQWlCO0FBQ2pCLHVEQUF1RDtBQUN2RCx3Q0FBd0M7QUFDeEMsbUVBQW1FO0FBQ25FLFlBQVk7QUFDWixRQUFRO0FBRVIsOEdBQThHO0FBQzlHLGlDQUFpQztBQUVqQyw2Q0FBNkM7QUFFN0MsNkRBQTZEO0FBRTdELG1FQUFtRTtBQUNuRSxnRkFBZ0Y7QUFDaEYsdURBQXVEO0FBQ3ZELFlBQVk7QUFFWiw0Q0FBNEM7QUFDNUMsNERBQTREO0FBRTVELDJEQUEyRDtBQUMzRCwwQ0FBMEM7QUFDMUMsNEZBQTRGO0FBRTVGLCtCQUErQjtBQUMvQiw0QkFBNEI7QUFDNUIseURBQXlEO0FBQ3pELFlBQVk7QUFFWiwyQ0FBMkM7QUFFM0MsbUJBQW1CO0FBQ25CLHdCQUF3QjtBQUN4QiwyQkFBMkI7QUFDM0Isb0RBQW9EO0FBQ3BELHVDQUF1QztBQUN2QyxrREFBa0Q7QUFFbEQsaUNBQWlDO0FBQ2pDLGdEQUFnRDtBQUNoRCwrREFBK0Q7QUFFL0QsbUVBQW1FO0FBRW5FLG1GQUFtRjtBQUNuRixnQ0FBZ0M7QUFDaEMsdUVBQXVFO0FBQ3ZFLDRDQUE0QztBQUM1QywrR0FBK0c7QUFDL0csd0VBQXdFO0FBQ3hFLDRCQUE0QjtBQUM1Qix3QkFBd0I7QUFDeEIsb0JBQW9CO0FBRXBCLHNDQUFzQztBQUN0Qyw2RkFBNkY7QUFDN0Ysb0JBQW9CO0FBRXBCLHFFQUFxRTtBQUNyRSxxREFBcUQ7QUFFckQsMkdBQTJHO0FBQzNHLDBFQUEwRTtBQUMxRSxpQkFBaUI7QUFDakIscUNBQXFDO0FBQ3JDLGdFQUFnRTtBQUNoRSxrRUFBa0U7QUFDbEUsaUJBQWlCO0FBQ2pCLDBEQUEwRDtBQUMxRCxjQUFjO0FBQ2Qsd0JBQXdCO0FBQ3hCLFFBQVE7QUFDUixJQUFJIn0=