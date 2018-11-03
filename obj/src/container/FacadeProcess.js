"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const FacadeFactory_1 = require("../build/FacadeFactory");
class FacadeProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("facade", "Client facade microservice");
        this._factories.add(new FacadeFactory_1.FacadeFactory);
    }
}
exports.FacadeProcess = FacadeProcess;
//# sourceMappingURL=FacadeProcess.js.map