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
                const type = AlertifyAdapter.mapNotifyType(style);
                if (source.notify) {
                    source.notify(message, type);
                } else if (source.log) {
                    source.log(message, type);
                }
                return adapter;
            },
            set: (options: any, key?: any, value?: any) => {
                // Legacy alertify 0.3: set({ labels: { ok, cancel } })
                if (options && typeof options === "object" && key === undefined) {
                    if (options.labels) {
                        const labels = options.labels;
                        if (labels.ok !== undefined && source.defaults?.glossary) {
                            source.defaults.glossary.ok = labels.ok;
                        }
                        if (labels.cancel !== undefined && source.defaults?.glossary) {
                            source.defaults.glossary.cancel = labels.cancel;
                        }
                        source.set?.("confirm", "labels", labels);
                    }
                    return adapter;
                }
                // alertifyjs 1.x native: set(name, key, value)
                if (typeof options === "string") {
                    source.set?.(options, key, value);
                }
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

    private static mapNotifyType(style?: string): string {
        if (!style) return "success";
        const normalized = style.toLowerCase();
        if (normalized === "error" || normalized === "danger") return "error";
        if (normalized === "warning") return "warning";
        if (normalized === "success") return "success";
        return normalized;
    }
}
