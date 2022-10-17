import { GasTankProps, GasTanksType } from '../types';
import { configEnv } from '../utils/global';

import { GasTank } from './GasTank';

configEnv();
export class ZeroWallet {
    #gasTanks = {} as { [key: string]: GasTank };

    constructor(gasTanks?: GasTanksType) {
        if (gasTanks) {
            gasTanks.forEach((gasTank: GasTankProps) => {
                this.#gasTanks[gasTank.apiKey] = new GasTank(gasTank);
            });
        }
    }

    addGasTank(gasTank: GasTankProps) {
        this.#gasTanks[gasTank.apiKey] = new GasTank(gasTank);
    }

    getGasTank = (apiKey: string): GasTank => {
        return this.#gasTanks[apiKey];
    };
}
