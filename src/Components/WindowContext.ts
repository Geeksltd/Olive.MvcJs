import Url from 'olive/Components/Url'
import Form from 'olive/Components/Form'
import Waiting from 'olive/Components/Waiting'

export default class WindowContext {

    static initialize() {
        window["download"] = (url) => {
            $("<iframe style='visibility:hidden; width:1px; height:1px;'></iframe>").attr("src", url).appendTo("body");

        };
    }

    static events: { [event: string]: Function[] } = {};

    public static toJson(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.log(error);
            console.log('Cannot parse this data to Json: ');
            console.log(data);
        }
    }

    public static fitFrameContentHeight(iframe) {
        $(iframe).height(iframe.contentWindow.document.body.scrollHeight);
    }
}