import { ServiceContainer } from "./serviceContainer";
export declare class ServiceDescription {
    key: string;
    private singleton;
    private container;
    factory: (...args: IService[]) => IService;
    dependencies: string[];
    private instance;
    constructor(key: string, singleton: boolean, container: ServiceContainer);
    setFactory(factory: (...args: IService[]) => IService): ServiceDescription;
    addDependency: (dep: string) => ServiceDescription;
    addDependencies: (...deps: string[]) => ServiceDescription;
    withDependencies(...deps: string[]): ServiceDescription;
    getInstance: () => IService;
    private createInstance;
}
