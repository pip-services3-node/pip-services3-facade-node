let _ = require('lodash');
let express = require('express');

import { IConfigurable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';

import { IFacadeService } from './IFacadeService';

export class FacadeService implements IConfigurable, IReferenceable, IFacadeService {
    protected _rootPath: string = '';
    protected _partition: any =  express();
    protected _dependencyResolver: DependencyResolver = new DependencyResolver();
    protected _logger = new CompositeLogger();

    public constructor() {}

    public configure(config: ConfigParams): void {
        this._rootPath = config.getAsStringWithDefault('root_path', this._rootPath);
        if (this._rootPath.length > 0 && !this._rootPath.startsWith('/'))
                this._rootPath = '/' + this._rootPath;
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._logger.setReferences(references);
    }

    public getRootPath(): string {
        return this._rootPath;
    }

    public registerMiddleware(
        action: (req: any, res: any, next: () => void) => void): void {
        this._partition.use(action);
    }

    public registerMiddlewareForPath(path: string,
        action: (req: any, res: any, next: () => void) => void): void {
        this._partition.use(path, action);
    }

    public registerRoute(method: string, route: string, 
        action: (req: any, res: any) => void): void {
        if (method == 'del') method = 'delete';

        this._logger.debug(null, 'Registering route %s %s', method, this.getRootPath() + route);
        this._partition[method](route, action);
    }

    public registerRouteWithAuth(method: string, route: string, 
        authorize: (req: any, res: any, next: () => void) => void,
        action: (req: any, res: any) => void): void {
        if (method == 'del') method = 'delete';

        this._logger.debug(null, 'Registering route %s %s', method, this.getRootPath() + route);
        this._partition[method](route, authorize, action);
    }
}