import { describe, expect, test } from '@jest/globals';

import { ZeroWallet } from '../lib/ZeroWallet';

const sum = (a: number, b: number) => a + b;
const constants = {
    address: '0x0000000000000000000000000000000000000000'
};

describe('sum module', () => {
    test('Create Zero Wallet and check addAuthorizedUser and doesUserExist functions', async () => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');
        expect(await gasTank.doesUserExist(constants.address)).toBe(false);
        await gasTank.addAuthorizedUser(constants.address);
        expect(await gasTank.doesUserExist(constants.address)).toBe(true);
    });
    test('Create Zero Wallet and check deleteUser function', async () => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');

        await gasTank.addAuthorizedUser(constants.address);
        expect(await gasTank.doesUserExist(constants.address)).toBe(true);
        await gasTank.deleteUser(constants.address);
        expect(await gasTank.doesUserExist(constants.address)).toBe(false);
    });
    test('Create Zero Wallet and check isInWhiteList function', async () => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');

        const contractAddress = 'contract-address';
        const contractAddress2 = 'contract-address2';
        expect( gasTank.isInWhiteList(contractAddress2)).toBe(false);
        expect( gasTank.isInWhiteList(contractAddress)).toBe(true);
        await gasTank.authorizer.delete();
    });
    test('Create Zero Wallet and check getNonce function', async () => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');

        await gasTank.addAuthorizedUser(constants.address);
        const nonce = await gasTank.getNonce(constants.address);
        expect(typeof nonce).toBe('string');
        if (typeof nonce !== 'string') {
            return;
        }
        expect(nonce.length).toBe(100);
        const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        expect(nonce).toMatch(new RegExp(`[${characters}]+`));
    });
          
});
