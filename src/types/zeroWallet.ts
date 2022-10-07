import { ethers } from 'ethers';
import { SupportedChainId } from '../constants/chains';

export type ZeroWalletProviders = {
  [key in SupportedChainId]?: ethers.providers.Provider;
};

export type GasTank = {
  dappName: string;
  apiKey: string;
  fundingKey: string;
};

export type GasTanks = {
  [key in SupportedChainId]?: GasTank;
};
