export default class Alert implements IService {
    enableAlert(): void;
    alert(text: string, style?: string, callback?: Function): void;
    private confirm;
    alertUnobtrusively(message: string, style?: string): void;
}
