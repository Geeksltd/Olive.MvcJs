define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var CrossDomainEvent = /** @class */ (function () {
        function CrossDomainEvent() {
        }
        CrossDomainEvent.handle = function (command, handler) {
            window.addEventListener("message", function (e) {
                try {
                    var info = null;
                    if (e.data.startsWith('{')) {
                        info = JSON.parse(e.data);
                    }
                    else {
                        info = JSON.parse('"' + e.data + '"');
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Jvc3NEb21haW5FdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Nyb3NzRG9tYWluRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQTtRQUFBO1FBaUNBLENBQUM7UUFoQ2lCLHVCQUFNLEdBQXBCLFVBQXFCLE9BQWUsRUFBRSxPQUE2QjtZQUMvRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQUEsQ0FBQztnQkFDaEMsSUFBSTtvQkFFQSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7b0JBRWhCLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDN0I7eUJBQ0k7d0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7cUJBQ3pDO29CQUVELElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxPQUFPO3dCQUFFLE9BQU87b0JBRXJDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3JCO2dCQUNELE9BQU8sS0FBSyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3hCO1lBQ0wsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2QsQ0FBQztRQUVhLHNCQUFLLEdBQW5CLFVBQW9CLE1BQWMsRUFBRSxPQUFlLEVBQUUsR0FBZTtZQUFmLG9CQUFBLEVBQUEsVUFBZTtZQUVoRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN0QixPQUFPLEVBQUUsT0FBTztnQkFDaEIsR0FBRyxFQUFFLEdBQUc7YUFDWCxDQUFDLENBQUM7WUFFSCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0wsdUJBQUM7SUFBRCxDQUFDLEFBakNELElBaUNDIn0=