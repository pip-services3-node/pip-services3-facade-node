import { ConfigParams } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IOpenable } from 'pip-services3-commons-node';
import { ConnectionParams } from 'pip-services3-components-node';
import { CredentialParams } from 'pip-services3-components-node';
import { FacadeService } from './FacadeService';
export declare class MainFacadeService extends FacadeService implements IOpenable {
    private static readonly _defaultConfig;
    private _server;
    private _http;
    private _connectionResolver;
    private _credentialResolver;
    private _debug;
    private _maintenance_enabled;
    private _maxSockets;
    private _maxReqSize;
    constructor();
    isMaintenanceEnabled(): boolean;
    setMaintenanceEnabed(value: boolean): void;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    isOpen(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    protected getConnection(correlationId: string, callback: (err: any, result: ConnectionParams) => void): void;
    protected getCredential(correlationId: string, connection: ConnectionParams, callback: (err: any, result: CredentialParams) => void): void;
    private createHttp;
    private createServer;
    private noCache;
    private doMaintenance;
}