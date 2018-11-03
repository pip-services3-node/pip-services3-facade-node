"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const MainFacadeService_1 = require("../services/MainFacadeService");
const PartitionFacadeService_1 = require("../services/PartitionFacadeService");
const AboutOperations_1 = require("../operations/AboutOperations");
class FacadeFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(FacadeFactory.MainFacadeServiceDescriptor, MainFacadeService_1.MainFacadeService);
        this.registerAsType(FacadeFactory.PartitionFacadeServiceDescriptor, PartitionFacadeService_1.PartitionFacadeService);
        this.registerAsType(FacadeFactory.AboutOperationsDescriptor, AboutOperations_1.AboutOperations);
    }
}
FacadeFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "factory", "facade", "default", "1.0");
FacadeFactory.MainFacadeServiceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "facade-service", "default", "*", "1.0");
FacadeFactory.PartitionFacadeServiceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "facade-partition", "default", "*", "1.0");
FacadeFactory.AuthManagerDescriptor = new pip_services3_commons_node_1.Descriptor("pip-service", "facade-authorization", "default", "*", "1.0");
FacadeFactory.SessionManagerDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "facade-session", "default", "*", "1.0");
FacadeFactory.AboutOperationsDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services", "facade-operations", "about", "*", "1.0");
exports.FacadeFactory = FacadeFactory;
//# sourceMappingURL=FacadeFactory.js.map