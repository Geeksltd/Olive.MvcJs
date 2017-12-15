export class Alert{
    
    public static  enableAlert() {
        var w: any = window;
        w.alert = (text: string, callback) => this.alert(text, null, callback);
    }

    public static alert(text: string, style?: string, callback?: Function) {

                if (text == undefined) text = "";
                text = text.trim();
        
                if (text.indexOf("<") != 0) {
                    text = text.replace(/\r/g, "<br />");
                    alertify.alert(text, callback, style);
                }
                else {
                    alertify.alert('', callback, style);
                    $('.alertify-message').empty().append($.parseHTML(text));
                }
    }

    public static  alertUnobtrusively(message: string, style?: string) {
        alertify.log(message, style);
    }

}
