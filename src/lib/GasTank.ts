import {ethers} from 'ethers'

import { SupportedChainId } from '../constants/chains';
import {
    DatabaseConfig,
    GasTankProps,
    SendGaslessTransactionParams,
    SendGaslessTransactionType
} from '../types';

import { BiconomyRelayer } from './relayers/BiconomyRelayer';

export class GasTank {
    // public fields
    gasTankName: string;
    chainId: SupportedChainId;

    // private fields
    #relayer: BiconomyRelayer; // We can simply swap out biconomy by using a different relayer

    constructor(gasTank: GasTankProps, databaseConfig: DatabaseConfig) {
        this.gasTankName = gasTank.name;
        this.chainId = gasTank.chainId;
        this.#relayer = new BiconomyRelayer(
            {
                name: gasTank.name,
                chainId: gasTank.chainId,
                provider: new ethers.providers.JsonRpcProvider(gasTank.providerURL),
                apiKey: gasTank.apiKey,
                providerURL:gasTank.providerURL
            },
            databaseConfig
        );
    }

    async sendGaslessTransaction(
        params: SendGaslessTransactionParams
    ): Promise<SendGaslessTransactionType> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        return this.#relayer.sendGaslessTransaction(params);
    }

    public toString(): string {
        return `GasTank: ${this.gasTankName}, chainId: ${this.chainId}`;
    }
}
