import Url from 'olive/components/url'

export default class Waiting implements IService {

    constructor(private url: Url) { }

    public show(blockScreen: boolean = false, validate: boolean = true) {

        if (validate) {
            for (let i = 0; i < document.forms.length; i++)
                if (!$(document.forms[i]).valid()) return;
        }

        let screen = $("<div class='wait-screen' />").appendTo("body");
        if (blockScreen) {
            $("<div class='cover' />")
                .width(Math.max($(document).width(), $(window).width()))
                .height(Math.max($(document).height(), $(window).height()))
                .appendTo(screen);
        }

        var imageUrl = this.url.ofContent('/img/loading.gif');

        $("<div class='wait-container'><div class='wait-box'><img src='" + imageUrl + "'/></div>")
            .appendTo(screen)
            .fadeIn('slow');
    }

    public hide() {
        $(".wait-screen").remove();
    }
}