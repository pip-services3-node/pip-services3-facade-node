"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionFacadeService = void 0;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const FacadeService_1 = require("./FacadeService");
class PartitionFacadeService extends FacadeService_1.FacadeService {
    constructor() {
        super();
        this._dependencyResolver.put('parent', new pip_services3_commons_node_1.Descriptor('pip-services', 'facade-service', 'default', '*', '*'));
    }
    configure(config) {
        super.configure(config);
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        super.setReferences(references);
        this._parent = this._dependencyResolver.getOneRequired('parent');
        this._parent.registerMiddlewareForPath(this._rootPath, this._partition);
        this.register();
    }
    getRootPath() {
        return this._parent.getRootPath() + this._rootPath;
    }
    register() {
        // Override in child classes
    }
}
exports.PartitionFacadeService = PartitionFacadeService;
//# sourceMappingURL=PartitionFacadeService.js.map