import { readFileSync } from 'fs';

import { load } from 'js-yaml';

import { DatabaseConfig, fileDoc, GasTankProps, GasTanksType } from '../types';

import { GasTank } from './GasTank';

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
                    gasTank
                );
            });
        }
    }


    getGasTank = (apiKey: string): GasTank => {
        return this.#gasTanks[apiKey];
    };
}
