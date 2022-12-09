import { Biconomy } from '@biconomy/mexa';
import { ethers } from 'ethers';

import { SupportedChainId } from '../../constants/chains';
import {
    BiconomyRelayerProps,
    BiconomySendGaslessTransactionParams,
    BiconomyWalletClientType,
    InitBiconomyRelayerProps,
    SendGaslessTransactionType,
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
    #biconomy = {} as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    #biconomyWalletClient?: BiconomyWalletClientType;
    #biconomyLoading: Promise<void>;

    constructor(relayerProps: BiconomyRelayerProps) {
        const provider = new ethers.providers.JsonRpcProvider(
            relayerProps.providerURL
        ) as ZeroWalletProviderType;

        this.chainId = +relayerProps.chainId;
        this.#provider = provider;
        this.#apiKey = relayerProps.apiKey;

        this.#biconomyLoading = this.initRelayer({
            provider: this.#provider
        } as InitBiconomyRelayerProps);
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

    async doesSCWExists(zeroWalletAddress: string): Promise<{
        doesWalletExist: boolean;
        walletAddress: string;
    }> {
        await this.#waitForBiconomyWalletClient();

        const { doesWalletExist, walletAddress } =
            await this.#biconomyWalletClient!.checkIfWalletExists({
                eoa: zeroWalletAddress
            });

        return { doesWalletExist, walletAddress };
    }

    async #unsafeDeploySCW(zeroWalletAddress: string): Promise<string> {
        const { doesWalletExist, walletAddress } = await this.doesSCWExists(
            zeroWalletAddress
        );

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

    async deploySCW(zeroWalletAddress: string) {
        await this.#waitForBiconomyWalletClient();

        const scwAddress = await this.#unsafeDeploySCW(zeroWalletAddress);

        return scwAddress;
    }

    async buildExecTransaction(
        populatedTx: string,
        targetContractAddress: string,
        scwAddress: string
    ) {
        // @TODO: add check for target contract address

        await this.#waitForBiconomyWalletClient();

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
        const txHash =
            await this.#biconomyWalletClient!.sendBiconomyWalletTransaction({
                execTransactionBody: params.safeTXBody,
                walletAddress: params.scwAddress,
                signature: params.signature
            });

        return txHash;
    }
}
