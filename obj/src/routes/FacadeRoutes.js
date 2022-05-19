"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacadeRoutes = void 0;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
class FacadeRoutes {
    constructor() {
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._counters = new pip_services3_components_node_2.CompositeCounters();
        this._dependencyResolver = new pip_services3_commons_node_2.DependencyResolver();
        this._dependencyResolver.put("service", new pip_services3_commons_node_1.Descriptor("pip-services-facade", "service", "*", "*", "*"));
    }
    configure(config) {
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._dependencyResolver.setReferences(references);
        this._service = this._dependencyResolver.getOneRequired('service');
        this.register();
    }
    instrument(correlationId, method, route) {
        this._logger.debug(correlationId, "Calling %s %s", method, route);
        this._counters.incrementOne(route + "." + method + ".calls");
    }
    getCorrelationId(req) {
        return req.params.correlation_id;
    }
    registerRoute(method, route, action) {
        let actionCurl = (req, res) => {
            let correlationId = this.getCorrelationId(req);
            this.instrument(correlationId, method, route);
            action.call(this, req, res);
        };
        this._service.registerRoute(method, route, actionCurl);
    }
    registerRouteWithAuth(method, route, authorize, action) {
        let actionCurl = (req, res) => {
            let correlationId = this.getCorrelationId(req);
            this.instrument(correlationId, method, route);
            action.call(this, req, res);
        };
        this._service.registerRouteWithAuth(method, route, authorize, actionCurl);
    }
    registerMiddleware(action) {
        let actionCurl = (req, res, next) => {
            action.call(this, req, res, next);
        };
        this._service.registerMiddleware(actionCurl);
    }
}
exports.FacadeRoutes = FacadeRoutes;
//# sourceMappingURL=FacadeRoutes.js.map