export default class Waiting{

    public static showPleaseWait(blockScreen: boolean = false) {
        
                if (!$(document.forms[0]).valid()) return;        
                var screen = $("<div class='wait-screen' />").appendTo("body");        
                if (blockScreen) {
                    $("<div class='cover' />")
                        .width(Math.max($(document).width(), $(window).width()))
                        .height(Math.max($(document).height(), $(window).height()))
                        .appendTo(screen);
                }
        
                $("<div class='wait-container'><div class='wait-box'><img src='/public/img/loading.gif'/></div>")
                    .appendTo(screen)
                    .fadeIn('slow');
      }

      public static hidePleaseWait() {
        $(".wait-screen").remove();
       }
}
