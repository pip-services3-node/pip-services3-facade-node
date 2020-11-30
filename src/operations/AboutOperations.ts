﻿/** @module operations */
/** @hidden */ 
let os = require('os');

import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { ContextInfo } from 'pip-services3-components-node';
import { HttpRequestDetector } from 'pip-services3-rpc-node';

import { FacadeOperations } from './FacadeOperations';

export class AboutOperations extends FacadeOperations {
    private _contextInfo: ContextInfo;

    public setReferences(references: IReferences): void {
        super.setReferences(references);

        this._contextInfo = references.getOneOptional<ContextInfo>(
            new Descriptor('pip-services', 'context-info', '*', '*', '*')
        );
    }

    public getAboutOperation() {
        return (req, res) => {
            this.getAbout(req, res);
        };
    }

    private getNetworkAddresses(): string[] {
        let interfaces = os.networkInterfaces();
        let addresses: string[] = [];
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

    private getAbout(req, res) {
        let about = {
            server: {
                name: this._contextInfo != null ? this._contextInfo.name : 'unknown',
                description: this._contextInfo != null ? this._contextInfo.description : null,
                properties: this._contextInfo != null ? this._contextInfo.properties : null,
                uptime: this._contextInfo != null ? this._contextInfo.uptime : null,
                start_time: this._contextInfo != null ? this._contextInfo.startTime : null,

                current_time: new Date().toISOString(),
                protocol: req.protocol,
                host: HttpRequestDetector.detectServerHost(req),
                addresses: this.getNetworkAddresses(),
                port: HttpRequestDetector.detectServerPort(req),
                url: req.originalUrl,
            },
            client: {
                address: HttpRequestDetector.detectAddress(req),
                client: HttpRequestDetector.detectBrowser(req),
                platform: HttpRequestDetector.detectPlatform(req),
                user: req.user
            }
        };

        res.json(about);
    }

}
