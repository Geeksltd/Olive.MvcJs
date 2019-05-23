export default class Alert {
    static enableAlert(): void;
    static alert(text: string, style?: string, callback?: Function): void;
    static confirm(text: string, style?: string, callback?: Function): void;
    static alertUnobtrusively(message: string, style?: string): void;
}
