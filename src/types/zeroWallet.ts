import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';

export type ZeroWalletProviderType = ethers.providers.JsonRpcProvider;

export type ZeroWalletProvidersType = {
    [key in SupportedChainId]: ZeroWalletProviderType;
};

export type GasTankProps = {
    gasTankName: string;
    apiKey: string;
    fundingKey: string;
    chainId: SupportedChainId;
    provider: ZeroWalletProviderType;
};

export type GasTanksType = Array<GasTankProps>;
