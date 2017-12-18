import Waiting from 'olive/Components/Waiting'
import MvcAction from 'olive/Components/MvcAction'

export default class AjaxRedirect {
    static ajaxChangedUrl = 0;
    static isAjaxRedirecting = false;

    public static enable(event: JQueryEventObject, callback) {
        if (event.ctrlKey || event.button === 1) return true;
        var link = $(event.currentTarget);
        var url = link.attr('href');
        this.go(url, link, false, false, true, (response, containerModule, trigger) => { callback(response, containerModule, trigger); });
        return false;
    }

    public static back(event, backCallback) {
        if (this.ajaxChangedUrl == 0) return;
        this.ajaxChangedUrl--;
        this.go(location.href, null, true, false, true, (response, containerModule, trigger) => { backCallback(response, containerModule, trigger); });
    }

    public static go(url: string, trigger: JQuery = null, isBack: boolean = false, keepScroll: boolean = false, addToHistory = true, callback: (response: any, containerModule: JQuery, trigger: JQuery) => void) {
        this.isAjaxRedirecting = true;
        MvcAction.isAwaitingAjaxResponse = true;
        if (window.stop) window.stop();
        else if (document.execCommand !== undefined) document.execCommand("Stop", false);

        var scrollTopBefore;
        if (keepScroll) {
            scrollTopBefore = $(document).scrollTop();
        }
        Waiting.showPleaseWait();

        $.ajax({
            url: url,
            type: 'GET',
            success: (response) => {
                MvcAction.events = {};

                if (!isBack) {
                    this.ajaxChangedUrl++;
                    if (addToHistory) history.pushState({}, $("#page_meta_title").val(), url);
                }

                MvcAction.isAwaitingAjaxResponse = false;
                this.isAjaxRedirecting = false;
                callback(response, null, trigger);
                if (keepScroll) {
                    $(document).scrollTop(scrollTopBefore);
                }
            },
            error: (response) => location.href = url,
            complete: (response) => Waiting.hidePleaseWait()
        });
        return false;
    }
}