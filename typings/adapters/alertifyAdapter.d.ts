/**
 * Maps legacy alertify 0.3 API calls to alertifyjs 1.x.
 */
export default class AlertifyAdapter {
    static resolve(): alertify.IAlertifyStatic;
    private static loadAlertify;
    private static wrap;
}
