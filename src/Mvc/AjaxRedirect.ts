import Waiting from 'olive/Components/Waiting'
import FormAction from 'olive/Mvc/FormAction'

export default class AjaxRedirect {
    static ajaxChangedUrl = 0;
    static isAjaxRedirecting = false;
    
    public static enableBack(selector:JQuery){selector.off("popstate.ajax-redirect").on("popstate.ajax-redirect", (e) => this.back(e));}

    public static enableRedirect(selector:JQuery){selector.off("click.ajax-redirect").on("click.ajax-redirect", (e) => this.redirect(e));}
    
   static redirect(event: JQueryEventObject) {
        if (event.ctrlKey || event.button === 1) return true;
        let link = $(event.currentTarget);
        let url = link.attr('href');
        this.go(url, link, false, false, true);
        return false;
    }

   static back(event) {
        if (this.ajaxChangedUrl == 0) return;
        this.ajaxChangedUrl--;
        this.go(location.href, null, true, false, false);
    }

    public static go(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false,
        addToHistory = true) {
        this.isAjaxRedirecting = true;
        FormAction.isAwaitingAjaxResponse = true;
        if (window.stop) window.stop();
        else if (document.execCommand !== undefined) document.execCommand("Stop", false);

        let scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }
        Waiting.show();

        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {
                FormAction.events = {};

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory) history.pushState({}, $("#page_meta_title").val(), url);
                }

                FormAction.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;
                FormAction.processAjaxResponse(response, null, trigger);

                if (keepScroll) $(document).scrollTop(scrollTopBefore);
            },
            error: (response) => location.href = url,
            complete: (response) => Waiting.hide()
        });
        return false;
    }
}
