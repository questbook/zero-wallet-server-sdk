import { ethers } from 'ethers';

export enum SupportedChainId {
  CELO_MAINNET = 42220,
  GOERLI_TESTNET = 5,
  OPTIMISM_MAINNET = 10,
  POLYGON_MAINNET = 137,
}

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
