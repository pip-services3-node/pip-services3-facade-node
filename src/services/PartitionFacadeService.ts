/** @module services */
import { ConfigParams } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';

import { IFacadeService } from './IFacadeService';
import { FacadeService } from './FacadeService';

export class PartitionFacadeService extends FacadeService {
    protected _parent: IFacadeService;

    public constructor() {
        super();
        this._dependencyResolver.put('parent', new Descriptor('pip-services', 'facade-service', 'default', '*', '*'));
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._parent = this._dependencyResolver.getOneRequired<IFacadeService>('parent');
        this._parent.registerMiddlewareForPath(this._rootPath, this._partition);
        this.register();
    }

    public getRootPath(): string {
        return this._parent.getRootPath() + this._rootPath;
    }

    protected register(): void {
        // Override in child classes
    }

}