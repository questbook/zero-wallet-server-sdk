export interface BaseAuthorizer {
    name: string;

    addAuthorizedUser: (address: string) => Promise<void>;
    refreshUserAuthorization: (address: string) => Promise<string>;
    isUserAuthorized: (address: string, nonce: string) => Promise<boolean>;
}
