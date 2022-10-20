import { SignedMessage } from "../../types";

export interface BaseAuthorizer {
    name: string;

    addAuthorizedUser: (address: string) => Promise<void>;
    refreshUserAuthorization: (address: string) => Promise<string>;
    isUserAuthorized: (signedNonce: SignedMessage, address: string, nonce: string) => Promise<boolean>;
}
