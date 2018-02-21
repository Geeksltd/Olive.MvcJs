import Url from 'olive/Components/Url'

export default class Waiting {

    public static show(blockScreen: boolean = false) {

        if (!$(document.forms[0]).valid()) return;
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