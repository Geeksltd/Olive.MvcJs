import { ServiceDescription } from "./serviceDescription";
export declare class ServiceContainer {
    private services;
    tryAddSingleton(key: string, factory: (...args: IService[]) => IService, serviceOut: IOutParam<ServiceDescription>): boolean;
    tryAddTransient(key: string, factory: (...args: IService[]) => IService, serviceOut: IOutParam<ServiceDescription>): boolean;
    addSingleton(key: string, factory: (...args: IService[]) => IService): ServiceDescription;
    addTransient(key: string, factory: (...args: IService[]) => IService): ServiceDescription;
    getService<T extends IService>(key: string): T;
    private try;
    private add;
}
