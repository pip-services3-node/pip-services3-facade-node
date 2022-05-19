"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainFacadeService = void 0;
/** @module services */
/** @hidden */
let _ = require('lodash');
let async = require('async');
let fs = require('fs');
let express = require('express');
let http = require('http');
let https = require('https');
let connectTimeout = require('connect-timeout');
let getoverride = require('get-methodoverride');
let cors = require('cors');
let os = require('os');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const FacadeService_1 = require("./FacadeService");
class MainFacadeService extends FacadeService_1.FacadeService {
    constructor() {
        super();
        this._connectionResolver = new pip_services3_components_node_1.ConnectionResolver();
        this._credentialResolver = new pip_services3_components_node_2.CredentialResolver();
        this._debug = true;
        this._maintenance_enabled = false;
        this._maxSockets = 50;
        this._maxReqSize = '1mb';
        this._rootPath = '';
    }
    isMaintenanceEnabled() {
        return this._maintenance_enabled;
    }
    setMaintenanceEnabed(value) {
        this._maintenance_enabled = value;
    }
    configure(config) {
        config = config.setDefaults(MainFacadeService._defaultConfig);
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
        this._rootPath = config.getAsStringWithDefault('root_path', this._rootPath);
        if (this._rootPath.length > 0 && !this._rootPath.startsWith('/'))
            this._rootPath = '/' + this._rootPath;
        this._debug = config.getAsBooleanWithDefault('options.debug', this._debug);
        this._maintenance_enabled = config.getAsBooleanWithDefault('options.maintenance_enabled', this._maintenance_enabled);
        this._maxSockets = config.getAsIntegerWithDefault('options.max_sockets', this._maxSockets);
        this._maxReqSize = config.getAsStringWithDefault('options.max_req_size', this._maxReqSize);
    }
    setReferences(references) {
        super.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }
    isOpen() {
        return this._http != null;
    }
    open(correlationId, callback) {
        // Exit if already opened
        if (this._http != null) {
            if (callback)
                callback(null);
            return;
        }
        let connection;
        let credential;
        async.series([
            (callback) => {
                this.getConnection(correlationId, (err, result) => {
                    connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this.getCredential(correlationId, connection, (err, result) => {
                    credential = result;
                    callback(err);
                });
            },
            (callback) => {
                this._server = this.createServer();
                this._http = this.createHttp(this._server, connection, credential);
                let host = os.hostname();
                let port = connection.getPort();
                this._http.listen(port, (err) => {
                    if (err) {
                        this._http = null;
                        this._logger.error(correlationId, err, 'Failed to start HTTP server at %s:%d', host, port);
                    }
                    else {
                        this._logger.info(correlationId, 'Started HTTP server %s:%d', host, port);
                    }
                    if (callback)
                        callback(err);
                });
            }
        ], callback);
    }
    close(correlationId, callback) {
        if (this._http != null) {
            this._http.close((err) => {
                this._logger.info(correlationId, 'Closed HTTP server');
            });
        }
        this._http = null;
        this._server = null;
        if (callback)
            callback(null);
    }
    getConnection(correlationId, callback) {
        this._connectionResolver.resolve(correlationId, (err, con) => {
            let connection = con;
            // Check for connection
            if (connection == null) {
                err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_CONNECTION", "Connection for REST client is not defined");
            }
            else {
                // Check for type
                let protocol = connection.getProtocolWithDefault("http");
                if ("http" != protocol && "https" != protocol) {
                    err = new pip_services3_commons_node_2.ConfigException(correlationId, "WRONG_PROTOCOL", "Protocol is not supported by REST connection")
                        .withDetails("protocol", protocol);
                    // Check for host
                }
                else if (connection.getHost() == null) {
                    err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_HOST", "No host is configured in REST connection");
                    // Check for port
                }
                else if (connection.getPort() == 0) {
                    err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_PORT", "No port is configured in REST connection");
                }
            }
            callback(err, connection);
        });
    }
    getCredential(correlationId, connection, callback) {
        // Credentials are not required unless HTTPS is used
        if (connection.getProtocolWithDefault("http") != "https") {
            callback(null, null);
            return;
        }
        this._credentialResolver.lookup(correlationId, (err, con) => {
            let credential = con;
            // Check for connection
            if (credential == null) {
                err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_CREDENTIAL", "SSL certificates are not configured for HTTPS protocol");
            }
            else {
                if (credential.getAsNullableString('ssl_key_file') == null) {
                    err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_SSL_KEY_FILE", "SSL key file is not configured in credentials");
                }
                else if (credential.getAsNullableString('ssl_crt_file') == null) {
                    err = new pip_services3_commons_node_2.ConfigException(correlationId, "NO_SSL_CRT_FILE", "SSL crt file is not configured in credentials");
                }
            }
            callback(err, credential);
        });
    }
    createHttp(server, connection, credential) {
        if (connection.getProtocolWithDefault('http') == 'https') {
            let sslKeyFile = credential.getAsNullableString('ssl_key_file');
            let privateKey = fs.readFileSync(sslKeyFile).toString();
            let sslCrtFile = credential.getAsNullableString('ssl_crt_file');
            let certificate = fs.readFileSync(sslCrtFile).toString();
            let ca = [];
            let sslCaFile = credential.getAsNullableString('ssl_ca_file');
            if (sslCaFile != null) {
                let caText = fs.readFileSync(sslCaFile).toString();
                while (caText != null && caText.trim().length > 0) {
                    let crtIndex = caText.lastIndexOf('-----BEGIN CERTIFICATE-----');
                    if (crtIndex > -1) {
                        ca.push(caText.substring(crtIndex));
                        caText = caText.substring(0, crtIndex);
                    }
                }
            }
            https.globalAgent.maxSockets = this._maxSockets;
            return https.createServer({
                key: privateKey,
                cert: certificate,
                ca: ca
            }, server);
        }
        else {
            http.globalAgent.maxSockets = this._maxSockets;
            return http.createServer(server);
        }
    }
    createServer() {
        let server = express();
        server.use(connectTimeout(60000));
        //server.use(log.connect());
        server.use(express.cookieParser());
        server.use(express.json());
        server.use(express.urlencoded());
        server.use(express.methodOverride());
        server.use(cors());
        server.use((req, res, next) => { this.noCache(req, res, next); });
        server.use((req, res, next) => { this.doMaintenance(req, res, next); });
        // Define error handling
        if (this._debug)
            server.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
        else
            server.use(express.errorHandler());
        // Connect configured partition
        if (this._rootPath != '')
            server.use(this._rootPath, this._partition);
        else
            server.use(this._partition);
        return server;
    }
    // Prevents IE from caching REST requests
    noCache(req, res, next) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
        next();
    }
    // Returns maintenance error code
    doMaintenance(req, res, next) {
        // Make this more sophisticated
        if (this._maintenance_enabled) {
            res.header('Retry-After', 3600);
            res.json(503);
        }
        else
            next();
    }
}
exports.MainFacadeService = MainFacadeService;
MainFacadeService._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('root_path', '', 'connection.protocol', 'http', 'connection.hostname', '0.0.0.0', 'connection.port', 8080, 'credential.ssl_key_file', null, 'credential.ssl_crt_file', null, 'credential.ssl_ca_file', null, 'options.debug', true, 'options.maintenance_enabled', false, 'options.max_sockets', 50, 'options.max_req_size', '1mb');
//# sourceMappingURL=MainFacadeService.js.map