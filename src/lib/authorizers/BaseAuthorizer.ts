export interface BaseAuthorizer {
    name: string;

    addAuthorizedUser: (address: string) => Promise<void>;
    refreshUserAuthorization: (address: string) => Promise<string>;
    checkAuthorizedUser: (address: string, nonce: string) => Promise<boolean>;
}
