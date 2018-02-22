define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var Alert = /** @class */ (function () {
        function Alert() {
        }
        Alert.enableAlert = function () {
            var _this = this;
            var w = window;
            w.alert = function (text, callback) { return _this.alert(text, null, callback); };
        };
        Alert.alert = function (text, style, callback) {
            if (text === undefined)
                text = "";
            text = text.trim();
            if (text.indexOf("<") != 0) {
                text = text.replace(/\r/g, "<br />");
                alertify.alert(text, callback, style);
            }
            else {
                alertify.alert('', callback, style);
                $('.alertify-message').empty().append($.parseHTML(text));
            }
        };
        Alert.alertUnobtrusively = function (message, style) {
            alertify.log(message, style);
        };
        return Alert;
    }());
    exports.default = Alert;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9hbGVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBQUE7UUF5QkEsQ0FBQztRQXZCaUIsaUJBQVcsR0FBekI7WUFBQSxpQkFHQztZQUZHLElBQUksQ0FBQyxHQUFRLE1BQU0sQ0FBQztZQUNwQixDQUFDLENBQUMsS0FBSyxHQUFHLFVBQUMsSUFBWSxFQUFFLFFBQVEsSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztRQUMzRSxDQUFDO1FBRWEsV0FBSyxHQUFuQixVQUFvQixJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQW1CO1lBRWpFLEVBQUUsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7Z0JBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRW5CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQztZQUNELElBQUksQ0FBQyxDQUFDO2dCQUNGLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3RCxDQUFDO1FBQ0wsQ0FBQztRQUVhLHdCQUFrQixHQUFoQyxVQUFpQyxPQUFlLEVBQUUsS0FBYztZQUM1RCxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0wsWUFBQztJQUFELENBQUMsQUF6QkQsSUF5QkMifQ==