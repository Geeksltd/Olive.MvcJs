export default class Alert implements IService {
    enableAlert(): void;
    alert(text: string, style?: string, callback?: Function): void;
    confirm(text: string, style?: string, callback?: Function): void;
    alertUnobtrusively(message: string, style?: string): void;
}
