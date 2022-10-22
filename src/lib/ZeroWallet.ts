import { readFileSync } from 'fs';

import { ethers } from 'ethers';
import { load } from 'js-yaml';

import { DatabaseConfig, fileDoc, GasTankProps, GasTanksType } from '../types';

import { GasTank } from './GasTank';

// const fs = require('fs');

// const yaml = require('js-yaml');

export class ZeroWallet {
    #gasTanks = {} as { [key: string]: GasTank };
    #databaseConfig: DatabaseConfig;

    constructor(path: string) {
        let doc: fileDoc;
        try {
            doc = load(readFileSync(path, 'utf8'));
        } catch (e) {
            throw new Error(e);
        }

        this.#databaseConfig = doc.databaseConfig;
        const gasTanks: GasTanksType = doc.gasTanks;

        if (gasTanks) {
            gasTanks.forEach((gasTank: GasTankProps) => {
                this.#gasTanks[gasTank.apiKey] = new GasTank(
                    gasTank,
                    this.#databaseConfig
                );
            });
        }
    }

    addGasTank(gasTank: GasTankProps) {
        this.#gasTanks[gasTank.apiKey] = new GasTank(
            gasTank,
            this.#databaseConfig
        );
    }

    getGasTank = (apiKey: string): GasTank => {
        return this.#gasTanks[apiKey];
    };
}
