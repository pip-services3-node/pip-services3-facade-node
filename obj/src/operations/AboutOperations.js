"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutOperations = void 0;
/** @module operations */
/** @hidden */
let os = require('os');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const FacadeOperations_1 = require("./FacadeOperations");
class AboutOperations extends FacadeOperations_1.FacadeOperations {
    setReferences(references) {
        super.setReferences(references);
        this._contextInfo = references.getOneOptional(new pip_services3_commons_node_1.Descriptor('pip-services', 'context-info', '*', '*', '*'));
    }
    getAboutOperation() {
        return (req, res) => {
            this.getAbout(req, res);
        };
    }
    getNetworkAddresses() {
        let interfaces = os.networkInterfaces();
        let addresses = [];
        for (let k in interfaces) {
            for (let k2 in interfaces[k]) {
                let address = interfaces[k][k2];
                if (address.family === 'IPv4' && !address.internal) {
                    addresses.push(address.address);
                }
            }
        }
        return addresses;
    }
    getAbout(req, res) {
        let about = {
            server: {
                name: this._contextInfo != null ? this._contextInfo.name : 'unknown',
                description: this._contextInfo != null ? this._contextInfo.description : null,
                properties: this._contextInfo != null ? this._contextInfo.properties : null,
                uptime: this._contextInfo != null ? this._contextInfo.uptime : null,
                start_time: this._contextInfo != null ? this._contextInfo.startTime : null,
                current_time: new Date().toISOString(),
                protocol: req.protocol,
                host: pip_services3_rpc_node_1.HttpRequestDetector.detectServerHost(req),
                addresses: this.getNetworkAddresses(),
                port: pip_services3_rpc_node_1.HttpRequestDetector.detectServerPort(req),
                url: req.originalUrl,
            },
            client: {
                address: pip_services3_rpc_node_1.HttpRequestDetector.detectAddress(req),
                client: pip_services3_rpc_node_1.HttpRequestDetector.detectBrowser(req),
                platform: pip_services3_rpc_node_1.HttpRequestDetector.detectPlatform(req),
                user: req.user
            }
        };
        res.json(about);
    }
}
exports.AboutOperations = AboutOperations;
//# sourceMappingURL=AboutOperations.js.map