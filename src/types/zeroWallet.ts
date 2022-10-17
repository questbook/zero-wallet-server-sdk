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

export type SendGaslessTransactionParams = BiconomySendGaslessTransactionParams; // @TODO-update

export type SendGaslessTransactionType = string; // @TODO-update

export type InitRelayerProps = InitBiconomyRelayerProps; // @TODO-update

export type InitRelayerType = InitBiconomyRelayerType; // @TODO-update
