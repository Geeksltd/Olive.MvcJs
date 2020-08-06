export type CrossDomainEventCommands =
    "refresh-page" |
    "set-iframe-height" |
    "close-modal" |
    "file-uploaded" |
    string;

export default class CrossDomainEvent {
    public static handle(command: CrossDomainEventCommands, handler: ((arg: any) => void)) {
        window.addEventListener("message", (e) => {
            try {

                let info = null;

                if (e.data.startsWith("{")) {
                    info = JSON.parse(e.data);
                } else {
                    info = JSON.parse('"' + e.data + '"');
                }

                if (info.command !== command) { return; }

                handler(info.arg);
            } catch (error) {
                console.error(error);
            }
        }, false);
    }

    public static raise(window: Window, command: CrossDomainEventCommands, arg: any = null) {
        const json = JSON.stringify({
            command,
            arg,
        });

        window.postMessage(json, "*");
    }
}
