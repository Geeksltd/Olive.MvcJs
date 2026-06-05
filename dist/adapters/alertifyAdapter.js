define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Maps legacy alertify 0.3 API calls to alertifyjs 1.x.
     */
    class AlertifyAdapter {
        static resolve() {
            const loaded = this.loadAlertify();
            return this.wrap(loaded);
        }
        static loadAlertify() {
            var _a;
            if ((_a = window.alertify) === null || _a === void 0 ? void 0 : _a.alert) {
                return window.alertify;
            }
            if (window.require) {
                const required = window.require("alertify");
                return typeof required === "function" ? required() : required;
            }
            return window.alertify;
        }
        static wrap(source) {
            if (!source) {
                return window.alertify;
            }
            if (source.__oliveAdapterApplied) {
                return source;
            }
            const adapter = {
                alert: (text, callback, style) => {
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
                confirm: (text, callback, style) => {
                    if (source.confirm.length >= 2) {
                        source.confirm(text, (confirmed) => {
                            if (callback) {
                                callback(confirmed);
                            }
                        });
                    }
                    else {
                        source.confirm(text, callback);
                    }
                    if (style && source.set) {
                        source.set("type", style);
                    }
                    return adapter;
                },
                log: (message, style) => {
                    const type = AlertifyAdapter.mapNotifyType(style);
                    if (source.notify) {
                        source.notify(message, type);
                    }
                    else if (source.log) {
                        source.log(message, type);
                    }
                    return adapter;
                },
                set: (options, key, value) => {
                    var _a, _b, _c, _d;
                    // Legacy alertify 0.3: set({ labels: { ok, cancel } })
                    if (options && typeof options === "object" && key === undefined) {
                        if (options.labels) {
                            const labels = options.labels;
                            if (labels.ok !== undefined && ((_a = source.defaults) === null || _a === void 0 ? void 0 : _a.glossary)) {
                                source.defaults.glossary.ok = labels.ok;
                            }
                            if (labels.cancel !== undefined && ((_b = source.defaults) === null || _b === void 0 ? void 0 : _b.glossary)) {
                                source.defaults.glossary.cancel = labels.cancel;
                            }
                            (_c = source.set) === null || _c === void 0 ? void 0 : _c.call(source, "confirm", "labels", labels);
                        }
                        return adapter;
                    }
                    // alertifyjs 1.x native: set(name, key, value)
                    if (typeof options === "string") {
                        (_d = source.set) === null || _d === void 0 ? void 0 : _d.call(source, options, key, value);
                    }
                    return adapter;
                },
                success: (message) => {
                    var _a;
                    (_a = source.success) === null || _a === void 0 ? void 0 : _a.call(source, message);
                    return adapter;
                },
                error: (message) => {
                    var _a;
                    (_a = source.error) === null || _a === void 0 ? void 0 : _a.call(source, message);
                    return adapter;
                },
                warning: (message) => {
                    var _a;
                    (_a = source.warning) === null || _a === void 0 ? void 0 : _a.call(source, message);
                    return adapter;
                },
            };
            adapter.__oliveAdapterApplied = true;
            window.alertify = adapter;
            return adapter;
        }
        static mapNotifyType(style) {
            if (!style)
                return "success";
            const normalized = style.toLowerCase();
            if (normalized === "error" || normalized === "danger")
                return "error";
            if (normalized === "warning")
                return "warning";
            if (normalized === "success")
                return "success";
            return normalized;
        }
    }
    exports.default = AlertifyAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnRpZnlBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkYXB0ZXJzL2FsZXJ0aWZ5QWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTs7T0FFRztJQUNILE1BQXFCLGVBQWU7UUFFekIsTUFBTSxDQUFDLE9BQU87WUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU8sTUFBTSxDQUFDLFlBQVk7O1lBQ3ZCLElBQUksTUFBQyxNQUFjLENBQUMsUUFBUSwwQ0FBRSxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsT0FBUSxNQUFjLENBQUMsUUFBUSxDQUFDO1lBQ3BDLENBQUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxPQUFPLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDbEUsQ0FBQztZQUNELE9BQVEsTUFBYyxDQUFDLFFBQVEsQ0FBQztRQUNwQyxDQUFDO1FBRU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFXO1lBQzNCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDVixPQUFRLE1BQWMsQ0FBQyxRQUFRLENBQUM7WUFDcEMsQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE9BQU8sTUFBTSxDQUFDO1lBQ2xCLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBNkI7Z0JBQ3RDLEtBQUssRUFBRSxDQUFDLElBQVksRUFBRSxRQUFtQyxFQUFFLEtBQWMsRUFBRSxFQUFFO29CQUN6RSxJQUFJLE1BQU0sQ0FB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