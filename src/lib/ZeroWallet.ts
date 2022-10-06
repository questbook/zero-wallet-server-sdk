import { ZeroWalletProviders } from "../types";

export class ZeroWallet {

    #providers = {} as ZeroWalletProviders;
    constructor(
        providers: ZeroWalletProviders
    ) {
        this.#providers = providers;
    }

    getProvider(networkId: number) {
        return this.#providers[networkId];
    }

    setProvider(networkId: number, provider: any) {
        this.#providers[networkId] = provider;
    }


}