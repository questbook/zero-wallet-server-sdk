import { WalletImportFormatError } from '@bitauth/libauth';
import { afterAll, describe, expect, test } from '@jest/globals';
import { ethers } from 'ethers';
import { GasTank } from '../lib/GasTank';
import { ZeroWallet } from '../lib/ZeroWallet';

const constants = {
    wallet: ethers.Wallet.createRandom(),
    zeroWallet: new ZeroWallet('./testing.yml')
};
afterAll(() => {
    constants.zeroWallet
        .getGasTank('testGasTankName')
        .authorizer.endConnection();
    // constants.zeroWallet
    //     .getGasTank('testGasTankName')
    //     .authorizer.delete();
});

describe('testing authorizer', () => {
    test('check addAuthorizedUser and doesUserExist functions', async () => {
        const gasTank = constants.zeroWallet.getGasTank('testGasTankName');

        await gasTank.authorizer.loadingTableCreationWithIndex;
        expect(await gasTank.doesUserExist(constants.wallet.address)).toBe(
            false
        );

        await gasTank.addAuthorizedUser(constants.wallet.address);
        expect(await gasTank.doesUserExist(constants.wallet.address)).toBe(
            true
        );
    });
    test('check deleteUser function', async () => {
        const gasTank = constants.zeroWallet.getGasTank('testGasTankName');

        expect(await gasTank.doesUserExist(constants.wallet.address)).toBe(
            true
        );
        await gasTank.deleteUser(constants.wallet.address);
        expect(await gasTank.doesUserExist(constants.wallet.address)).toBe(
            false
        );
    });
    test('check isInWhiteList function', async () => {
        const gasTank = constants.zeroWallet.getGasTank('testGasTankName');

        const contractAddress = 'contract-address';
        const contractAddress2 = 'contract-address2';
        expect(gasTank.isInWhiteList(contractAddress2)).toBe(false);
        expect(gasTank.isInWhiteList(contractAddress)).toBe(true);
    });

    test('check getNonce function', async () => {
        const gasTank = constants.zeroWallet.getGasTank('testGasTankName');

        await gasTank.addAuthorizedUser(constants.wallet.address);
        const nonce = await gasTank.getNonce(constants.wallet.address);
        await gasTank.deleteUser(constants.wallet.address);
        expect(typeof nonce).toBe('string');
        if (typeof nonce !== 'string') {
            return;
        }
        expect(nonce.length).toBe(100);
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        expect(nonce).toMatch(new RegExp(`[${characters}]+`));
    });

    test('check isUserAuthorized function', async () => {
        const gasTank = constants.zeroWallet.getGasTank('testGasTankName');

        await gasTank.addAuthorizedUser(constants.wallet.address);
        const nonce = await gasTank.getNonce(constants.wallet.address);
        expect(nonce).not.toBe(false);
        if (typeof nonce !== 'string') {
            return;
        }
        const signature = await constants.wallet.signMessage(nonce);
        const nonceSig = ethers.utils.splitSignature(signature);
        const nonceHash = ethers.utils.hashMessage(nonce);
        const signedNonce = {
            r: nonceSig.r,
            s: nonceSig.s,
            v: nonceSig.v,
            transactionHash: nonceHash
        };

        expect(
            await gasTank.authorizer.isUserAuthorized(
                signedNonce,
                nonce,
                constants.wallet.address
            )
        ).toBe(true);
    });
});
