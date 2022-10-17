import { Biconomy } from '@biconomy/mexa';

import { SupportedChainId } from '../../constants/chains';
import {
    BiconomyRelayerProps,
    BiconomySendGaslessTransactionParams,
    BiconomyWalletClientType,
    DatabaseConfig,
    InitBiconomyRelayerProps,
    SendGaslessTransactionType,
    WebHookAttributesType,
    ZeroWalletProviderType
} from '../../types';
import { delay } from '../../utils/global';
import { getTransactionReceipt } from '../../utils/provider';
import QuestbookAuthorizer from '../authorizers/QuestbookAuthorizer';

import { BaseRelayer } from './BaseRelayer';
export class BiconomyRelayer implements BaseRelayer {
    name = 'Biconomy';
    chainId: SupportedChainId;
    #provider: ZeroWalletProviderType;
    #apiKey: string;
    #fundingKey: string;
    #biconomy = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    #biconomyWalletClient?: BiconomyWalletClientType;
    #biconomyLoading: Promise<void>;
    #authorizer: QuestbookAuthorizer; // We can change the authorizer by simply swapping out the QuestbookAuthorizer

    constructor(
        relayerProps: BiconomyRelayerProps,
        databaseConfig: DatabaseConfig
    ) {
        this.chainId = relayerProps.chainId;
        this.#provider = relayerProps.provider;
        this.#apiKey = relayerProps.apiKey;
        this.#fundingKey = relayerProps.fundingKey;

        this.#biconomyLoading = this.initRelayer({
            provider: this.#provider
        } as InitBiconomyRelayerProps);

        this.#authorizer = new QuestbookAuthorizer(databaseConfig);
    }

    async #waitForBiconomyWalletClient() {
        await this.#biconomyLoading;
    }

    async initRelayer(params: InitBiconomyRelayerProps): Promise<void> {
        this.#biconomy = new Biconomy(params.provider, {
            apiKey: this.#apiKey
        });

        const _biconomyWalletClient =
            await new Promise<BiconomyWalletClientType>((resolve, reject) => {
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

        this.#biconomyWalletClient = _biconomyWalletClient;
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
            nonce: 'nonce',
            signedNonce: 'signedNonce',
            to: 'contractAddress',
            chainId: 5
            // @TODO: pass in the right webhook attributes
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
