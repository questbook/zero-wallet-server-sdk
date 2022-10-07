import { SupportedChainId } from '../constants/chains';
import { GasTankProps, GasTanksType, ZeroWalletProviderType } from '../types';
import { addWorkspace } from '../utils/biconomy';
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

    getGasTank(apiKey: string): GasTank {
        return this.#gasTanks[apiKey];
    }

    addGasTank(gasTank: GasTankProps) {
        this.#gasTanks[gasTank.apiKey] = new GasTank(gasTank);
    }

    async createGasTank(
        gasTankName: string,
        chainId: SupportedChainId,
        provider: ZeroWalletProviderType
    ): Promise<GasTank> {
        const { apiKey, fundingKey } = await addWorkspace(
            gasTankName,
            chainId.toString(),
            'TODO_AUTH_TOKEN'
        );

        const newGasTank = new GasTank({
            gasTankName: gasTankName,
            apiKey: apiKey,
            fundingKey: fundingKey,
            chainId: chainId,
            provider: provider
        });

        this.#gasTanks[apiKey] = newGasTank;

        return newGasTank;
    }
}
