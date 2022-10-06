import { ethers } from 'ethers';

export interface ZeroWalletProviders {
    [key: number]: ethers.providers.Provider
}