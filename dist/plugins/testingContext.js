define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestingContext = /** @class */ (function () {
        function TestingContext(ajaxRedirect, modalHelper, serverInvoker) {
            this.ajaxRedirect = ajaxRedirect;
            this.modalHelper = modalHelper;
            this.serverInvoker = serverInvoker;
            this.isLoaded = false;
        }
        TestingContext.prototype.isAjaxRedirecting = function () {
            return this.ajaxRedirect.isAjaxRedirecting;
        };
        TestingContext.prototype.isOpeningModal = function () {
            var _a;
            return !!((_a = this.modalHelper.currentModal) === null || _a === void 0 ? void 0 : _a.isOpening);
        };
        TestingContext.prototype.isClosingModal = function () {
            return this.modalHelper.isClosingModal;
        };
        TestingContext.prototype.isAwaitingAjaxResponse = function () {
            return this.serverInvoker.isAwaitingAjaxResponse;
        };
        TestingContext.prototype.isOliveMvcLoaded = function () {
            return this.isLoaded;
        };
        TestingContext.prototype.onPageInitialized = function () {
            this.isLoaded = true;
        };
        return TestingContext;
    }());
    exports.default = TestingContext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy90ZXN0aW5nQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFJQTtRQUdJLHdCQUNZLFlBQTBCLEVBQzFCLFdBQXdCLEVBQ3hCLGFBQTRCO1lBRjVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQzFCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBTGhDLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFNckIsQ0FBQztRQUVFLDBDQUFpQixHQUF4QjtZQUNJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztRQUMvQyxDQUFDO1FBRU0sdUNBQWMsR0FBckI7O1lBQ0ksT0FBTyxDQUFDLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSwwQ0FBRSxTQUFTLENBQUEsQ0FBQztRQUN0RCxDQUFDO1FBRU0sdUNBQWMsR0FBckI7WUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDO1FBQzNDLENBQUM7UUFFTSwrQ0FBc0IsR0FBN0I7WUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQXNCLENBQUM7UUFDckQsQ0FBQztRQUVNLHlDQUFnQixHQUF2QjtZQUNJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBRU0sMENBQWlCLEdBQXhCO1lBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUNMLHFCQUFDO0lBQUQsQ0FBQyxBQWhDRCxJQWdDQyJ9