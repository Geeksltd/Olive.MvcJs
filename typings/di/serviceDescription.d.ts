import { ServiceContainer } from "./serviceContainer";
export declare class ServiceDescription {
    key: string;
    private singleton;
    private container;
    private factory;
    private dependencies;
    private instance;
    constructor(key: string, singleton: boolean, container: ServiceContainer);
    setFactory(factory: (...args: IService[]) => IService): ServiceDescription;
    addDependency: (dep: string) => ServiceDescription;
    addDependencies: (...deps: string[]) => ServiceDescription;
    withDependencies(...deps: string[]): ServiceDescription;
    getInstance: () => IService;
    private createInstance;
}
