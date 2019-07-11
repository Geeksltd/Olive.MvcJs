import { ServiceDescription } from "./serviceDescription";

export class ServiceContainer {
    private services: Array<ServiceDescription> = new Array<ServiceDescription>();

    public tryAddSingleton(key: string, factory: (...args: IService[]) => IService, serviceOut: IOutParam<ServiceDescription>): boolean {
        return this.try(key, serviceOut, () => this.addSingleton(key, factory));
    }

    public tryAddTransient(key: string, factory: (...args: IService[]) => IService, serviceOut: IOutParam<ServiceDescription>): boolean {
        return this.try(key, serviceOut, () => this.addTransient(key, factory));
    }

    public addSingleton(key: string, factory: (...args: IService[]) => IService): ServiceDescription {
        return this.add(key, true, factory);
    };

    public addTransient(key: string, factory: (...args: IService[]) => IService): ServiceDescription {
        return this.add(key, false, factory);
    }

    public getService<T extends IService>(key: string): T {
        const service = this.services.filter(x => x.key === key)[0];

        if (!!service)
            return <T>service.getInstance();
        else
            throw `No service registered for '${key}'.`;
    }

    private try(key: string, serviceOut: IOutParam<ServiceDescription>, action: () => ServiceDescription) {
        if (this.services.some(s => s.key === key)) {
            serviceOut.value = this.services.filter(x => x.key === key)[0];
            return false;
        }

        serviceOut.value = action();
        return true;
    }

    private add(key: string, singleton: boolean, factory: (...args: IService[]) => IService): ServiceDescription {
        if (this.services.some(s => s.key === key))
            throw `A service with the same key (${key}) is already added`;

        var result = new ServiceDescription(key, singleton, this);
        result.setFactory(factory);
        this.services.push(result);

        return result;
    }
}