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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9hbGVydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUFBO1FBQUE7UUF5QkEsQ0FBQztRQXZCaUIsaUJBQVcsR0FBekI7WUFBQSxpQkFHQztZQUZHLElBQUksQ0FBQyxHQUFRLE1BQU0sQ0FBQztZQUNwQixDQUFDLENBQUMsS0FBSyxHQUFHLFVBQUMsSUFBWSxFQUFFLFFBQVEsSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsRUFBaEMsQ0FBZ0MsQ0FBQztRQUMzRSxDQUFDO1FBRWEsV0FBSyxHQUFuQixVQUFvQixJQUFZLEVBQUUsS0FBYyxFQUFFLFFBQW1CO1lBRWpFLElBQUksSUFBSSxLQUFLLFNBQVM7Z0JBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNsQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRW5CLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDckMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3pDO2lCQUNJO2dCQUNELFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUM1RDtRQUNMLENBQUM7UUFFYSx3QkFBa0IsR0FBaEMsVUFBaUMsT0FBZSxFQUFFLEtBQWM7WUFDNUQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQztRQUNMLFlBQUM7SUFBRCxDQUFDLEFBekJELElBeUJDIn0=