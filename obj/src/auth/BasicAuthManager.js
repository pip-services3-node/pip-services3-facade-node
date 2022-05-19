"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicAuthManager = void 0;
/** @module auth */
/** @hidden */
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class BasicAuthManager {
    anybody() {
        return (req, res, next) => {
            next();
        };
    }
    signed() {
        return (req, res, next) => {
            if (req.user == null) {
                pip_services3_rpc_node_1.HttpResponseSender.sendError(req, res, new pip_services3_commons_node_1.UnauthorizedException(null, 'NOT_SIGNED', 'User must be signed in to perform this operation').withStatus(401));
            }
            else {
                next();
            }
        };
    }
}
exports.BasicAuthManager = BasicAuthManager;
//# sourceMappingURL=BasicAuthManager.js.map