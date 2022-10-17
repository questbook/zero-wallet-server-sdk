import { ethers } from 'ethers';

import { SupportedChainId } from '../constants/chains';
import { GasTankProps, GasTanksType, ZeroWalletProvidersType } from '../types';

import { GasTank } from './GasTank';

export class ZeroWallet {
  #providers = {} as ZeroWalletProvidersType;
  #gasTanks = {} as { [key in SupportedChainId]: GasTank };

  constructor(providers: ZeroWalletProvidersType, gasTanks: GasTanksType) {
    this.#providers = providers;

    Object.entries(gasTanks).forEach((gasTank: [string, GasTankProps]) => {
      this.#gasTanks[parseInt(gasTank[0]) as SupportedChainId] = new GasTank(
        gasTank[1]
      );
    });
  }

  getProvider(networkId: SupportedChainId): ethers.providers.JsonRpcProvider {
    return this.#providers[networkId];
  }

  setProvider(
    networkId: SupportedChainId,
    provider: ethers.providers.JsonRpcProvider
  ) {
    this.#providers[networkId] = provider;
  }

  getGasTank(networkId: SupportedChainId): GasTank {
    return this.#gasTanks[networkId];
  }

  setGasTank(networkId: SupportedChainId, gasTank: GasTankProps) {
    this.#gasTanks[networkId] = new GasTank(gasTank);
  }
}
