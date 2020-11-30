/** @module auth */
/** @hidden */ 
let _ = require('lodash');

import { UnauthorizedException } from 'pip-services3-commons-node';
import { HttpResponseSender } from 'pip-services3-rpc-node';

export class OwnerAuthManager {

    public owner(idParam: string = 'user_id'): (req: any, res: any, next: () => void) => void {
        return (req, res, next) => {
            if (req.user == null) {
                HttpResponseSender.sendError(
                    req, res,
                    new UnauthorizedException(
                        null, 'NOT_SIGNED',
                        'User must be signed in to perform this operation'
                    ).withStatus(401)
                );
            } else {
                let userId = req.route.params[idParam] || req.param(idParam);
                if (req.user_id != userId) {
                    HttpResponseSender.sendError(
                        req, res,
                        new UnauthorizedException(
                            null, 'FORBIDDEN',
                            'Only data owner can perform this operation'
                        ).withStatus(403)
                    );
                } else {
                    next();
                }
            }
        };
    }

    public ownerOrAdmin(idParam: string = 'user_id'): (req: any, res: any, next: () => void) => void {
        return (req, res, next) => {
            if (req.user == null) {
                HttpResponseSender.sendError(
                    req, res,
                    new UnauthorizedException(
                        null, 'NOT_SIGNED',
                        'User must be signed in to perform this operation'
                    ).withStatus(401)
                );
            } else {
                let userId = req.route.params[idParam] || req.param(idParam);
                let roles = req.user != null ? req.user.roles : null;
                let admin = _.includes(roles, 'admin');
                if (req.user_id != userId && !admin) {
                    HttpResponseSender.sendError(
                        req, res,
                        new UnauthorizedException(
                            null, 'FORBIDDEN',
                            'Only data owner can perform this operation'
                        ).withStatus(403)
                    );
                } else {
                    next();
                }
            }
        };
    }

}
