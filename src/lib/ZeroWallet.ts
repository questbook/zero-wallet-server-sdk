import { DatabaseConfig, GasTankProps, GasTanksType } from '../types';
import { configEnv } from '../utils/global';

import { GasTank } from './GasTank';

configEnv();
export class ZeroWallet {
    #gasTanks = {} as { [key: string]: GasTank };
    #databaseConfig: DatabaseConfig;

    constructor(databaseConfig: DatabaseConfig, gasTanks?: GasTanksType) {
        this.#databaseConfig = databaseConfig;

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
