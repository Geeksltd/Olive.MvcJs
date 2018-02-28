import Url from 'olive/components/url'

export default class Waiting {

    public static show(blockScreen: boolean = false, validate: boolean = true) {

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

        var imageUrl = Url.ofContent('/img/loading.gif');

        $("<div class='wait-container'><div class='wait-box'><img src='" + imageUrl + "'/></div>")
            .appendTo(screen)
            .fadeIn('slow');
    }

    public static hide() {
        $(".wait-screen").remove();
    }
}