export default class CrossDomainEvent {
    public static handle(command: string, handler: ((arg: any) => void)) {
        window.addEventListener("message", e => {
            try {
                
                let info = null;

                if (e.data.startsWith('{')) {
                    info = JSON.parse(e.data);
                }
                else {
                    info = JSON.parse('"' + e.data + '"');
                }

                if (info.command !== command) return;

                handler(info.arg);
            }
            catch (error) {
                console.error(error);
            }
        }, false);
    }

    public static raise(window: Window, command: string, arg: any = null) {

        var json = JSON.stringify({
            command: command,
            arg: arg
        });

        window.postMessage(json, "*");
    }
}