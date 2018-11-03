import { IConfigurable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { IFacadeService } from './IFacadeService';
export declare class FacadeService implements IConfigurable, IReferenceable, IFacadeService {
    protected _rootPath: string;
    protected _partition: any;
    protected _dependencyResolver: DependencyResolver;
    protected _logger: CompositeLogger;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getRootPath(): string;
    registerMiddleware(action: (req: any, res: any, next: () => void) => void): void;
    registerMiddlewareForPath(path: string, action: (req: any, res: any, next: () => void) => void): void;
    registerRoute(method: string, route: string, action: (req: any, res: any) => void): void;
    registerRouteWithAuth(method: string, route: string, authorize: (req: any, res: any, next: () => void) => void, action: (req: any, res: any) => void): void;
}
