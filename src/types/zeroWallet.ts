import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';

import {
    BiconomyRelayerProps,
    BiconomySendGaslessTransactionParams,
    InitBiconomyRelayerProps,
    InitBiconomyRelayerType
} from './biconomy';

export type ZeroWalletProviderType = ethers.providers.JsonRpcProvider;

export type ZeroWalletProvidersType = {
    [key in SupportedChainId]: ZeroWalletProviderType;
};

export type GasTankProps = BiconomyRelayerProps; // @TODO-update

export type GasTanksType = Array<GasTankProps>;

export type fileDoc = {
    databaseConfig: DatabaseConfig;
    gasTanks: GasTanksType;
};

export type SendGaslessTransactionParams = BiconomySendGaslessTransactionParams; // @TODO-update

export type SendGaslessTransactionType = string; // @TODO-update

export type InitRelayerProps = InitBiconomyRelayerProps; // @TODO-update

export type InitRelayerType = InitBiconomyRelayerType; // @TODO-update

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
