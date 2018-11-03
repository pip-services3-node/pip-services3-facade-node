"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class OwnerAuthManager {
    owner(idParam = 'user_id') {
        return (req, res, next) => {
            if (req.user == null) {
                pip_services3_rpc_node_1.HttpResponseSender.sendError(req, res, new pip_services3_commons_node_1.UnauthorizedException(null, 'NOT_SIGNED', 'User must be signed in to perform this operation').withStatus(401));
            }
            else {
                let userId = req.route.params[idParam] || req.param(idParam);
                if (req.user_id != userId) {
                    pip_services3_rpc_node_1.HttpResponseSender.sendError(req, res, new pip_services3_commons_node_1.UnauthorizedException(null, 'FORBIDDEN', 'Only data owner can perform this operation').withStatus(403));
                }
                else {
                    next();
                }
            }
        };
    }
    ownerOrAdmin(idParam = 'user_id') {
        return (req, res, next) => {
            if (req.user == null) {
                pip_services3_rpc_node_1.HttpResponseSender.sendError(req, res, new pip_services3_commons_node_1.UnauthorizedException(null, 'NOT_SIGNED', 'User must be signed in to perform this operation').withStatus(401));
            }
            else {
                let userId = req.route.params[idParam] || req.param(idParam);
                let roles = req.user != null ? req.user.roles : null;
                let admin = _.includes(roles, 'admin');
                if (req.user_id != userId && !admin) {
                    pip_services3_rpc_node_1.HttpResponseSender.sendError(req, res, new pip_services3_commons_node_1.UnauthorizedException(null, 'FORBIDDEN', 'Only data owner can perform this operation').withStatus(403));
                }
                else {
                    next();
                }
            }
        };
    }
}
exports.OwnerAuthManager = OwnerAuthManager;
//# sourceMappingURL=OwnerAuthManager.js.map