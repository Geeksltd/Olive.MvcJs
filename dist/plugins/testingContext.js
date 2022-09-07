define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGluZ0NvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGx1Z2lucy90ZXN0aW5nQ29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUlBO1FBR0ksd0JBQ1ksWUFBMEIsRUFDMUIsV0FBd0IsRUFDeEIsYUFBNEI7WUFGNUIsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDMUIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDeEIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFMaEMsYUFBUSxHQUFHLEtBQUssQ0FBQztRQU1yQixDQUFDO1FBRUUsMENBQWlCLEdBQXhCO1lBQ0ksT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQy9DLENBQUM7UUFFTSx1Q0FBYyxHQUFyQjs7WUFDSSxPQUFPLENBQUMsUUFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksMENBQUUsU0FBUyxDQUFBLENBQUM7UUFDdEQsQ0FBQztRQUVNLHVDQUFjLEdBQXJCO1lBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztRQUMzQyxDQUFDO1FBRU0sK0NBQXNCLEdBQTdCO1lBQ0ksT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDO1FBQ3JELENBQUM7UUFFTSx5Q0FBZ0IsR0FBdkI7WUFDSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztRQUVNLDBDQUFpQixHQUF4QjtZQUNJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFDTCxxQkFBQztJQUFELENBQUMsQUFoQ0QsSUFnQ0MifQ==