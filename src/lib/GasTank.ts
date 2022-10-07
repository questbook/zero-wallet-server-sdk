import { Biconomy } from '@biconomy/mexa';

import { SupportedChainId } from '../constants/chains';
import {
    BiconomyWalletClientType,
    BuildExecTransactionType,
    GasTankProps,
    WebHookAttributesType,
    ZeroWalletProviderType
} from '../types';
import { delay } from '../utils/global';
import { getTransactionReceipt } from '../utils/provider';

export class GasTank {
    // public fields
    gasTankName: string;
    chainId: SupportedChainId;

    // private fields
    #provider: ZeroWalletProviderType;
    #apiKey: string;
    #fundingKey: string;
    #biconomy = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    #biconomyWalletClient?: BiconomyWalletClientType;

    constructor(gasTank: GasTankProps) {
        this.gasTankName = gasTank.gasTankName;
        this.#apiKey = gasTank.apiKey;
        this.#fundingKey = gasTank.fundingKey;
        this.chainId = gasTank.chainId;
        this.#provider = gasTank.provider;

        this.#initBiconomy(gasTank.provider).then(
            (biconomyWalletClient: BiconomyWalletClientType) => {
                this.#biconomyWalletClient = biconomyWalletClient;
            }
        );
    }

    async #waitForBiconomyWalletClient() {
        do {
            this.#biconomyWalletClient = this.#biconomy.biconomyWalletClient;
            if (!this.#biconomyWalletClient) {
                await delay(500);
            }
        } while (!this.#biconomyWalletClient);
    }

    async #initBiconomy(
        provider: ZeroWalletProviderType
    ): Promise<BiconomyWalletClientType> {
        this.#biconomy = new Biconomy(provider, {
            apiKey: this.#apiKey
        });

        return new Promise<BiconomyWalletClientType>((resolve, reject) => {
            this.#biconomy
                .onEvent(this.#biconomy.READY, async () => {
                    let biconomyWalletClient: BiconomyWalletClientType;

                    try {
                        do {
                            biconomyWalletClient =
                                this.#biconomy.biconomyWalletClient;
                            if (!biconomyWalletClient) {
                                await delay(500);
                            }
                        } while (!biconomyWalletClient);

                        resolve(biconomyWalletClient);
                    } catch (err) {
                        reject(err);
                    }
                })
                .onEvent(this.#biconomy.ERROR, (error: string) => {
                    reject(error);
                });
        });
    }

    async #unsafeDeploySCW(zeroWalletAddress: string): Promise<string> {
        await this.#waitForBiconomyWalletClient();

        const { doesWalletExist, walletAddress } =
            await this.#biconomyWalletClient!.checkIfWalletExists({
                eoa: zeroWalletAddress
            });

        let scwAddress: string;

        if (!doesWalletExist) {
            const { walletAddress, txHash } =
                await this.#biconomyWalletClient!.checkIfWalletExistsAndDeploy({
                    eoa: zeroWalletAddress
                }); // default index(salt) 0

            await getTransactionReceipt(this.#provider, txHash);

            scwAddress = walletAddress;
        } else {
            scwAddress = walletAddress;
        }

        return scwAddress;
    }

    async deploySCW(
        zeroWalletAddress: string,
        webHookAttributes: WebHookAttributesType
    ) {
        // @TODO: add nonce check before deploying the scw
        webHookAttributes;

        const scwAddress = await this.#unsafeDeploySCW(zeroWalletAddress);

        return scwAddress;
    }

    async buildExecTransaction(
        populatedTx: string,
        targetContractAddress: string,
        scwAddress: string
    ) {
        await this.#waitForBiconomyWalletClient();
        const safeTXBody =
            await this.#biconomyWalletClient!.buildExecTransaction({
                data: populatedTx,
                to: targetContractAddress,
                walletAddress: scwAddress
            });
        return safeTXBody;
    }

    async sendGaslessTransaction(
        safeTXBody: BuildExecTransactionType,
        scwAddress: string,
        signature: string,
        webHookAttributes: WebHookAttributesType
    ) {
        await this.#waitForBiconomyWalletClient();

        webHookAttributes;
        // @TODO: check for nonce before sending transaction
        const txHash =
            await this.#biconomyWalletClient?.sendBiconomyWalletTransaction({
                execTransactionBody: safeTXBody,
                walletAddress: scwAddress,
                signature
            });
        return txHash;
    }

    get apiKey() {
        return this.#apiKey;
    }

    set apiKey(apiKey: string) {
        this.#apiKey = apiKey;
    }

    get fundingKey(): string {
        return this.#fundingKey;
    }

    set fundingKey(fundingKey: string) {
        this.#fundingKey = fundingKey;
    }

    public toString(): string {
        return `GasTank: ${this.gasTankName}, apiKey: ${
            this.#apiKey
        }, fundingKey: ${this.#fundingKey}, chainId: ${this.chainId}`;
    }
}
