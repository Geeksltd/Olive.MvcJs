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
                    if (source.notify) {
                        source.notify(message, style);
                    }
                    else if (source.log) {
                        source.log(message, style);
                    }
                    return adapter;
                },
                set: (options) => {
                    var _a;
                    (_a = source.set) === null || _a === void 0 ? void 0 : _a.call(source, options);
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
    }
    exports.default = AlertifyAdapter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnRpZnlBZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FkYXB0ZXJzL2FsZXJ0aWZ5QWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFBQTs7T0FFRztJQUNILE1BQXFCLGVBQWU7UUFFekIsTUFBTSxDQUFDLE9BQU87WUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU8sTUFBTSxDQUFDLFlBQVk7O1lBQ3ZCLElBQUksTUFBQyxNQUFjLENBQUMsUUFBUSwwQ0FBRSxLQUFLLEVBQUUsQ0FBQztnQkFDbEMsT0FBUSxNQUFjLENBQUMsUUFBUSxDQUFDO1lBQ3BDLENBQUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxPQUFPLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7WUFDbEUsQ0FBQztZQUNELE9BQVEsTUFBYyxDQUFDLFFBQVEsQ0FBQztRQUNwQyxDQUFDO1FBRU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFXO1lBQzNCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDVixPQUFRLE1BQWMsQ0FBQyxRQUFRLENBQUM7WUFDcEMsQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7Z0JBQy9CLE9BQU8sTUFBTSxDQUFDO1lBQ2xCLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBNkI7Z0JBQ3RDLEtBQUssRUFBRSxDQUFDLElBQVksRUFBRSxRQUFtQyxFQUFFLEtBQWMsRUFBRSxFQUFFO29CQUN6RSxJQUFJLE1BQU0sQ0FB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