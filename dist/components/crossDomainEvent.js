define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CrossDomainEvent = /** @class */ (function () {
        function CrossDomainEvent() {
        }
        CrossDomainEvent.handle = function (command, handler) {
            window.addEventListener("message", function (e) {
                try {
                    var info = JSON.parse(e.data);
                    if (info.command !== command)
                        return;
                    handler(info.arg);
                }
                catch (error) {
                    console.error(error);
                }
            }, false);
        };
        CrossDomainEvent.raise = function (window, command, arg) {
            if (arg === void 0) { arg = null; }
            var json = JSON.stringify({
                command: command,
                arg: arg
            });
            window.postMessage(json, "*");
        };
        return CrossDomainEvent;
    }());
    exports.default = CrossDomainEvent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NEb21haW5FdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQTtRQUFBO1FBd0JBLENBQUM7UUF2QmlCLHVCQUFNLEdBQXBCLFVBQXFCLE9BQWUsRUFBRSxPQUE2QjtZQUMvRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQUEsQ0FBQztnQkFDaEMsSUFBSTtvQkFDQSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU87d0JBQUUsT0FBTztvQkFFckMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDckI7Z0JBQ0QsT0FBTyxLQUFLLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDeEI7WUFDTCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDZCxDQUFDO1FBRWEsc0JBQUssR0FBbkIsVUFBb0IsTUFBYyxFQUFFLE9BQWUsRUFBRSxHQUFlO1lBQWYsb0JBQUEsRUFBQSxVQUFlO1lBRWhFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3RCLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixHQUFHLEVBQUUsR0FBRzthQUNYLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDTCx1QkFBQztJQUFELENBQUMsQUF4QkQsSUF3QkMifQ==