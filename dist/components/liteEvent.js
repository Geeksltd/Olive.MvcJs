define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var LiteEvent = /** @class */ (function () {
        function LiteEvent() {
            this.handlers = [];
        }
        LiteEvent.prototype.handle = function (handler) {
            this.handlers.push(handler);
        };
        LiteEvent.prototype.remove = function (handler) {
            this.handlers = this.handlers.filter(function (h) { return h !== handler; });
        };
        LiteEvent.prototype.raise = function (data) {
            this.handlers.slice(0).forEach(function (h) { return h(data); });
        };
        return LiteEvent;
    }());
    exports.default = LiteEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl0ZUV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvbGl0ZUV2ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtZQUNZLGFBQVEsR0FBNEIsRUFBRSxDQUFDO1FBYW5ELENBQUM7UUFYVSwwQkFBTSxHQUFiLFVBQWMsT0FBNkI7WUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEMsQ0FBQztRQUVNLDBCQUFNLEdBQWIsVUFBYyxPQUE2QjtZQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLE9BQU8sRUFBYixDQUFhLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRU0seUJBQUssR0FBWixVQUFhLElBQVE7WUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFQLENBQU8sQ0FBQyxDQUFDO1FBQ2pELENBQUM7UUFDTCxnQkFBQztJQUFELENBQUMsQUFkRCxJQWNDIn0=