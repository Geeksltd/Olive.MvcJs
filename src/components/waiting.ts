import Url from 'olive/components/url'

export default class Waiting implements IService {

    // One overlay is shown for as long as any caller still holds a token. A caller that
    // passes its token back to hide() only clears the overlay when it is the last one out,
    // so a request that finishes early cannot take the spinner away from one still running.
    // Calling hide() with no token keeps the original clear-everything behaviour, which is
    // what the callers that hide without a matching show rely on.
    private tokens: string[] = [];
    private tokenSeed = 0;

    constructor(private url: Url) { }

    public show(blockScreen: boolean = false, validate: boolean = true): string {

        if (validate) {
            for (let i = 0; i < document.forms.length; i++)
                if (!$(document.forms[i]).valid()) return null;
        }

        const token = "wait-" + (++this.tokenSeed);
        this.tokens.push(token);

        const existing = $(".wait-screen");
        if (existing.length) {
            if (blockScreen && !existing.find(".cover").length) {
                this.addCover(existing.first());
            }
            return token;
        }

        let screen = $("<div class='wait-screen' />").appendTo("body");
        if (blockScreen) {
            this.addCover(screen);
        }

        var loadingContent = '';
        var customLoading = $("#loading");
        if (customLoading.length) {
            loadingContent = customLoading.html();
        } else {
            var imageUrl = this.url.ofContent('/img/loading.gif');
            loadingContent = "<img src='" + imageUrl + "'/>";
        }

        $("<div class='wait-container'><div class='wait-box'>" + loadingContent + "</div>")
            .appendTo(screen)
            .show();

        return token;
    }

    public hide(token?: string) {
        if (token) {
            this.tokens = this.tokens.filter(t => t !== token);
            if (this.tokens.length) return;
        } else {
            this.tokens = [];
        }

        $(".wait-screen").remove();
    }

    private addCover(screen: JQuery) {
        $("<div class='cover' />")
            .width(Math.max($(document).width(), $(window).width()))
            .height(Math.max($(document).height(), $(window).height()))
            .appendTo(screen);
    }
}
