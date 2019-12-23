import { ServiceContainer } from "./serviceContainer";

export class ServiceDescription {
    private factory: (...args: IService[]) => IService = () => { throw new Error(`factory is not provided for type '${this.key}'.`) };
    private dependencies = new Array<string>();
    private instance: IService;

    constructor(public key: string, private singleton: boolean, private container: ServiceContainer) {
    }

    public setFactory(factory: (...args: IService[]) => IService): ServiceDescription {
        this.factory = factory;
        return this;
    }

    public addDependency = (dep: string): ServiceDescription => {
        this.dependencies.push(dep);

        return this;
    }

    public addDependencies = (...deps: string[]): ServiceDescription => {
        deps.forEach(dep => {
            this.addDependency(dep);
        });

        return this;
    }

    public withDependencies(...deps: string[]): ServiceDescription {
        this.dependencies = new Array<string>();

        deps.forEach(dep => {
            this.addDependency(dep);
        });

        return this;
    }

    public getInstance = (): IService => {
        if (this.singleton) {
            if (!this.instance) {
                this.instance = this.createInstance();
            }

            return this.instance;
        }
        else {
            return this.createInstance()
        }
    }

    private createInstance = (): IService => {
        const deps = this.dependencies.map(k => this.container.getService(k));

        return this.factory.apply({}, <[]>deps);
    }
}