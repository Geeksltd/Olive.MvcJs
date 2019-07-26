export default class Alert implements IService {

    public enableAlert() {
        let w: any = window;
        w.alert = (text: string, callback) => this.alert(text, null, callback);
    }

    public alert(text: string, style?: string, callback?: Function) {

        if (text === undefined) text = "";
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

    public confirm(text: string, style?: string, callback?: Function) {

        if (text === undefined) text = "";
        text = text.trim();

        if (text.indexOf("<") != 0) {
            text = text.replace(/\r/g, "<br />");
            alertify.confirm(text, callback, style);
        }
        else {
            alertify.confirm('', callback, style);
            $('.alertify-message').empty().append($.parseHTML(text));
        }
    }

    public alertUnobtrusively(message: string, style?: string) {
        alertify.log(message, style);
    }
}
