define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DelayedInitializer = /** @class */ (function () {
        function DelayedInitializer() {
            this.delayedLoadMinCount = 5;
            this.delay = 100;
        }
        DelayedInitializer.prototype.initialize = function (selector, init) {
            if (selector.length >= this.delayedLoadMinCount) {
                setTimeout(function () { return selector.each(init); }, this.delay);
            }
            else {
                selector.each(init);
            }
        };
        return DelayedInitializer;
    }());
    exports.DelayedInitializer = DelayedInitializer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXllZEluaXRpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BsdWdpbnMvZGVsYXllZEluaXRpYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUE7UUFBQTtZQUNXLHdCQUFtQixHQUFXLENBQUMsQ0FBQztZQUNoQyxVQUFLLEdBQVcsR0FBRyxDQUFDO1FBVS9CLENBQUM7UUFSVSx1Q0FBVSxHQUFqQixVQUFrQixRQUFnQixFQUFFLElBQTJDO1lBQzNFLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzdDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBbkIsQ0FBbUIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDcEQ7aUJBQ0k7Z0JBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QjtRQUNMLENBQUM7UUFDTCx5QkFBQztJQUFELENBQUMsQUFaRCxJQVlDO0lBWlksZ0RBQWtCIn0=