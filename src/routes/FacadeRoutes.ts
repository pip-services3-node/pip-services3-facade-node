import { IConfigurable } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';

import { IFacadeService } from '../services/IFacadeService';

export abstract class FacadeRoutes implements IConfigurable, IReferenceable {
    protected _logger = new CompositeLogger();
    protected _counters = new CompositeCounters();
    protected _dependencyResolver = new DependencyResolver();
    protected _service: IFacadeService;

    public constructor() {
        this._dependencyResolver.put("service", new Descriptor("pip-services-facade", "service", "*", "*", "*"))
    }

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._dependencyResolver.setReferences(references);
        this._service = this._dependencyResolver.getOneRequired<IFacadeService>('service');

        this.register();
    }

	private instrument(correlationId: string, method: string, route: string): void {
		this._logger.debug(correlationId, "Calling %s %s", method, route);
		this._counters.incrementOne(route + "." + method + ".calls");
	}

    private getCorrelationId(req: any): any {
        return req.params.correlation_id;
    }

    public registerRoute(method: string, route: string, 
        action: (req: any, res: any) => void): void {

        let actionCurl = (req, res) => { 
            let correlationId = this.getCorrelationId(req);
            this.instrument(correlationId, method, route);
            action.call(this, req, res); 
        };

        this._service.registerRoute(method, route, actionCurl);
    }

    public registerRouteWithAuth(method: string, route: string, 
        authorize: (req: any, res: any, next: () => void) => void,
        action: (req: any, res: any) => void): void {

        let actionCurl = (req, res) => { 
            let correlationId = this.getCorrelationId(req);
            this.instrument(correlationId, method, route);
            action.call(this, req, res); 
        };

        this._service.registerRouteWithAuth(method, route, authorize, actionCurl);
    }

    public registerMiddleware(action: (req: any, res: any, next: () => void) => void): void {

        let actionCurl = (req, res, next) => { 
            action.call(this, req, res, next); 
        };

        this._service.registerMiddleware(actionCurl);
    }

    protected abstract register(): void;

}