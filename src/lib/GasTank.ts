import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';
import {
    DatabaseConfig,
    GasTankProps,
    SendGaslessTransactionParams,
    SendGaslessTransactionType,
    WebHookAttributesType
} from '../types';

import QuestbookAuthorizer from './authorizers/QuestbookAuthorizer';
import { BiconomyRelayer } from './relayers/BiconomyRelayer';

export class GasTank {
    // public fields
    gasTankName: string;
    chainId: SupportedChainId;

    // private fields
    #relayer: BiconomyRelayer; // We can simply swap out biconomy by using a different relayer
    #authorizer: QuestbookAuthorizer; // We can change the authorizer by simply swapping out the QuestbookAuthorizer

    constructor(gasTank: GasTankProps, databaseConfig: DatabaseConfig) {
        this.gasTankName = gasTank.name;
        this.chainId = gasTank.chainId;
        this.#relayer = new BiconomyRelayer({
            name: gasTank.name,
            chainId: gasTank.chainId,
            provider: new ethers.providers.JsonRpcProvider(gasTank.providerURL),
            apiKey: gasTank.apiKey,
            providerURL: gasTank.providerURL
        });
        this.#authorizer = new QuestbookAuthorizer(databaseConfig);
    }

    async sendGaslessTransaction(
        params: SendGaslessTransactionParams
    ): Promise<SendGaslessTransactionType> {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        return this.#relayer.sendGaslessTransaction(params);
    }

    async doesProxyWalletExist(zeroWalletAddress: string): Promise<{
        doesWalletExist: boolean;
        walletAddress: string;
    }> {
        return await this.#relayer.doesSCWExists(zeroWalletAddress);
    }

    async deployProxyWallet(
        zeroWalletAddress: string,
        webHookAttributes: WebHookAttributesType
    ) {
        if (
            !(await this.#authorizer.isUserAuthorized(
                webHookAttributes.signedNonce,
                webHookAttributes.nonce,
                zeroWalletAddress
            ))
        ) {
            throw new Error('User is not authorized');
        }
        return await this.#relayer.deploySCW(zeroWalletAddress);
    }

    public toString(): string {
        return `GasTank: ${this.gasTankName}, chainId: ${this.chainId}`;
    }
}
