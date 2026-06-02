/**
 * Maps legacy alertify 0.3 API calls to alertifyjs 1.x.
 */
export default class AlertifyAdapter {

    public static resolve(): alertify.IAlertifyStatic {
        const loaded = this.loadAlertify();
        return this.wrap(loaded);
    }

    private static loadAlertify(): any {
        if ((window as any).alertify?.alert) {
            return (window as any).alertify;
        }
        if (window.require) {
            const required = window.require("alertify");
            return typeof required === "function" ? required() : required;
        }
        return (window as any).alertify;
    }

    private static wrap(source: any): alertify.IAlertifyStatic {
        if (!source) {
            return (window as any).alertify;
        }

        if (source.__oliveAdapterApplied) {
            return source;
        }

        const adapter: alertify.IAlertifyStatic = {
            alert: (text: string, callback?: (...args: any[]) => void, style?: string) => {
                if (source.alert.length >= 2 && typeof source.alert === "function") {
                    const dialog = source.alert(text, callback, style);
                    return dialog || adapter;
                }
                source.alert(text, callback);
                if (style && source.set) {
                    source.set("type", style);
                }
                return adapter;
            },
            confirm: (text: string, callback?: (...args: any[]) => void, style?: string) => {
                if (source.confirm.length >= 2) {
                    source.confirm(text, (confirmed: boolean) => {
                        if (callback) {
                            callback(confirmed);
                        }
                    });
                } else {
                    source.confirm(text, callback);
                }
                if (style && source.set) {
                    source.set("type", style);
                }
                return adapter;
            },
            log: (message: string, style?: string) => {
                if (source.notify) {
                    source.notify(message, style);
                } else if (source.log) {
                    source.log(message, style);
                }
                return adapter;
            },
            set: (options: any) => {
                source.set?.(options);
                return adapter;
            },
            success: (message: string) => {
                source.success?.(message);
                return adapter;
            },
            error: (message: string) => {
                source.error?.(message);
                return adapter;
            },
            warning: (message: string) => {
                source.warning?.(message);
                return adapter;
            },
        };

        (adapter as any).__oliveAdapterApplied = true;
        (window as any).alertify = adapter;
        return adapter;
    }
}
