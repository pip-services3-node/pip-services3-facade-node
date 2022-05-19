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

import { ConfigParams } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ConfigException } from 'pip-services3-commons-node';

import { ConnectionParams } from 'pip-services3-components-node';
import { ConnectionResolver } from 'pip-services3-components-node';
import { CredentialParams } from 'pip-services3-components-node';
import { CredentialResolver } from 'pip-services3-components-node';

import { FacadeService } from './FacadeService';

export class MainFacadeService extends FacadeService implements IOpenable {
    private static readonly _defaultConfig = ConfigParams.fromTuples(
        'root_path', '',

        'connection.protocol', 'http',
        'connection.hostname', '0.0.0.0',
        'connection.port', 8080,

        'credential.ssl_key_file', null,
        'credential.ssl_crt_file', null,
        'credential.ssl_ca_file', null,

        'options.debug', true,
        'options.maintenance_enabled', false,
        'options.max_sockets', 50,
        'options.max_req_size', '1mb'
    );

    private _server: any;
    private _http: any;
    private _connectionResolver: ConnectionResolver = new ConnectionResolver();
    private _credentialResolver: CredentialResolver = new CredentialResolver();

    private _debug = true;
    private _maintenance_enabled = false;
    private _maxSockets = 50;
    private _maxReqSize = '1mb';
    
    public constructor() {
        super();
        this._rootPath = '';
    }

    public isMaintenanceEnabled(): boolean {
        return this._maintenance_enabled;
    }

    public setMaintenanceEnabed(value: boolean) {
        this._maintenance_enabled = value;
    }

    public configure(config: ConfigParams): void {
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

    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    public isOpen(): boolean {
        return this._http != null;
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        // Exit if already opened
        if (this._http != null) {
            if (callback) callback(null);
            return;
        }

        let connection: ConnectionParams;
        let credential: CredentialParams;

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
                    } else {
                        this._logger.info(correlationId, 'Started HTTP server %s:%d', host, port);
                    }

                    if (callback) callback(err);
                });
            }
        ], callback);
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        if (this._http != null) {
            this._http.close((err) => {
                this._logger.info(correlationId, 'Closed HTTP server');
            });
        }

        this._http = null;
        this._server = null;

        if (callback) callback(null);
    }

	protected getConnection(correlationId: string, callback: (err: any, result: ConnectionParams) => void): void {
        this._connectionResolver.resolve(correlationId, (err, con) => {
            let connection: ConnectionParams = con;

            // Check for connection
            if (connection == null) {
                err = new ConfigException(
                    correlationId, "NO_CONNECTION", "Connection for REST client is not defined");
            } else {
                // Check for type
                let protocol: string = connection.getProtocolWithDefault("http");
                if ("http" != protocol && "https" != protocol) {
                    err = new ConfigException(
                        correlationId, "WRONG_PROTOCOL", "Protocol is not supported by REST connection")
                        .withDetails("protocol", protocol);
                // Check for host
                } else  if (connection.getHost() == null) {
                    err = new ConfigException(
                        correlationId, "NO_HOST", "No host is configured in REST connection");
                // Check for port
                } else if (connection.getPort() == 0) {
                    err = new ConfigException(
                        correlationId, "NO_PORT", "No port is configured in REST connection");
                }
            }

            callback(err, connection);
        });
    }

	protected getCredential(correlationId: string, connection: ConnectionParams,
        callback: (err: any, result: CredentialParams) => void): void {

        // Credentials are not required unless HTTPS is used
        if (connection.getProtocolWithDefault("http") != "https") {
            callback(null, null);
            return;
        }

        this._credentialResolver.lookup(correlationId, (err, con) => {
            let credential: CredentialParams = con;

            // Check for connection
            if (credential == null) {
                err = new ConfigException(
                    correlationId, "NO_CREDENTIAL", "SSL certificates are not configured for HTTPS protocol");
            } else {
                if (credential.getAsNullableString('ssl_key_file') == null) {
                    err = new ConfigException(
                        correlationId, "NO_SSL_KEY_FILE", "SSL key file is not configured in credentials");
                } else if (credential.getAsNullableString('ssl_crt_file') == null) {
                    err = new ConfigException(
                        correlationId, "NO_SSL_CRT_FILE", "SSL crt file is not configured in credentials");
                }
            }

            callback(err, credential);
        });
    }

    private createHttp(server: any, connection: ConnectionParams, credential: CredentialParams): any {
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

            return https.createServer(
                {
                    key: privateKey, 
                    cert: certificate, 
                    ca: ca
                }, 
                server
            );
        } else {
            http.globalAgent.maxSockets = this._maxSockets;

            return http.createServer(server);
        }
    }

    private createServer(): any {
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
    private noCache(req: any, res: any, next: () => void): void {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
        next();
    }

    // Returns maintenance error code
    private doMaintenance(req: any, res: any, next: () => void): void {
        // Make this more sophisticated
        if (this._maintenance_enabled) {
            res.header('Retry-After', 3600);
            res.json(503);
        } else next();
    }

}