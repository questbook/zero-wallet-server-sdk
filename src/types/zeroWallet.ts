import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';

export type ZeroWalletProvidersType = {
  [key in SupportedChainId]: ethers.providers.JsonRpcProvider;
};

export type GasTankProps = {
  gasTankName: string;
  apiKey: string;
  fundingKey: string;
};

export type GasTanksType = {
  [key in SupportedChainId]?: GasTankProps;
};
