/**
 * The context object passing around in invocation methods.
 */
interface IInvocationContext {
    /**
     * Targeting URL.
     */
    url: string;
    trigger: JQuery;
    containerModule: JQuery;
    /**
     * An object to let drived classes keep whatever they need.
     */
    tag?: any;
}
