interface IServiceLocator extends IService {
    getService<T extends IService>(key: string): T;
}
