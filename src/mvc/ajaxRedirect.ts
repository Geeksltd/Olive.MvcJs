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
