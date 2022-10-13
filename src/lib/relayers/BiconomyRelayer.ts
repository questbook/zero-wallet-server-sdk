import { Biconomy } from '@biconomy/mexa';

import { SupportedChainId } from '../../constants/chains';
import {
    BiconomyRelayerProps,
    BiconomySendGaslessTransactionParams,
    BiconomyWalletClientType,
    InitBiconomyRelayerProps,
    SendGaslessTransactionType,
    WebHookAttributesType,
    ZeroWalletProviderType
} from '../../types';
import { delay } from '../../utils/global';
import { getTransactionReceipt } from '../../utils/provider';

import { BaseRelayer } from './BaseRelayer';

export class BiconomyRelayer implements BaseRelayer {
    name = 'Biconomy';
    chainId: SupportedChainId;
    #provider: ZeroWalletProviderType;
    #apiKey: string;
    #fundingKey: string;
    #biconomy = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    #biconomyWalletClient?: BiconomyWalletClientType;

    constructor(relayerProps: BiconomyRelayerProps) {
        this.chainId = relayerProps.chainId;
        this.#provider = relayerProps.provider;
        this.#apiKey = relayerProps.apiKey;
        this.#fundingKey = relayerProps.fundingKey;

        this.initRelayer({
            provider: this.#provider
        } as InitBiconomyRelayerProps).then(
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

    async initRelayer(
        params: InitBiconomyRelayerProps
    ): Promise<BiconomyWalletClientType> {
        this.#biconomy = new Biconomy(params.provider, {
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
        zeroWalletAddress: string
    ) {
        await this.#waitForBiconomyWalletClient();

        // @TODO: check for nonce before deploying the scw

        const scwAddress = await this.deploySCW(zeroWalletAddress, {
            webHookData: ''
        });

        const safeTXBody =
            await this.#biconomyWalletClient!.buildExecTransaction({
                data: populatedTx,
                to: targetContractAddress,
                walletAddress: scwAddress
            });

        return { scwAddress, safeTXBody };
    }

    async sendGaslessTransaction(
        params: BiconomySendGaslessTransactionParams
    ): Promise<SendGaslessTransactionType> {
        await this.#waitForBiconomyWalletClient();

        params.webHookAttributes;
        // @TODO: check for nonce before sending transaction

        const txHash =
            await this.#biconomyWalletClient!.sendBiconomyWalletTransaction({
                execTransactionBody: params.safeTXBody,
                walletAddress: params.scwAddress,
                signature: params.signature
            });

        return txHash;
    }

    // @TODO: use fundingKey to fund the gastank
}
