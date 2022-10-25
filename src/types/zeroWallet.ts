import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';

import {
    BiconomyBuildTransactionParams,
    BiconomyRelayerProps,
    BiconomySendGaslessTransactionParams,
    InitBiconomyRelayerProps,
    InitBiconomyRelayerType,
    WebHookAttributesType
} from './biconomy';

export type ZeroWalletProviderType = ethers.providers.JsonRpcProvider;

export type ZeroWalletProvidersType = {
    [key in SupportedChainId]: ZeroWalletProviderType;
};

export type GasTankProps = {
    name: string;
    apiKey: string;
    chainId: SupportedChainId;
    providerURL: string;
    databaseConfig: DatabaseConfig,
    whiteList: string[]
}

export type GasTanksType = Array<GasTankProps>;

export type fileDoc = {
    databaseConfig: DatabaseConfig;
    gasTanks: GasTanksType;
    whiteList:Array<string>;
};

export type SendGaslessTransactionParams = BiconomySendGaslessTransactionParams; // @TODO-update

export type SendGaslessTransactionType = string; // @TODO-update

export type InitRelayerProps = InitBiconomyRelayerProps; // @TODO-update

export type InitRelayerType = InitBiconomyRelayerType; // @TODO-update

export type BuildTransactionParams = BiconomyBuildTransactionParams;

export type deployProxyWalletParams = {
    zeroWalletAddress: string;
    webHookAttributes: WebHookAttributesType;
}
export type DatabaseConfig = {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
};


export type SignedMessage = {
    transactionHash: string;
    r: string;
    s: string;
    v: number;
};
