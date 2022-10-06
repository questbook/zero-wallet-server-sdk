import { ethers } from 'ethers';

import {
  GasTank,
  GasTanks,
  SupportedChainId,
  ZeroWalletProviders,
} from '../types';

export class ZeroWallet {
  #providers = {} as ZeroWalletProviders;
  #biconomyDapps = {} as GasTanks;

  constructor(providers: ZeroWalletProviders, biconomyDapps: GasTanks) {
    this.#providers = providers;
    this.#biconomyDapps = biconomyDapps;
  }

  getProvider(networkId: SupportedChainId) {
    return this.#providers[networkId];
  }

  setProvider(
    networkId: SupportedChainId,
    provider: ethers.providers.JsonRpcProvider
  ) {
    this.#providers[networkId] = provider;
  }

  getGasTank(networkId: SupportedChainId) {
    return this.#biconomyDapps[networkId];
  }

  setGasTank(networkId: SupportedChainId, gasTank: GasTank) {
    this.#biconomyDapps[networkId] = gasTank;
  }
}
