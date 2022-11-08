import anyTest, { TestFn } from 'ava';
import { ethers } from 'ethers';

import { GasTank } from '../lib/GasTank';
import { ZeroWallet } from '../lib/ZeroWallet';
import {
    DatabaseConfig,
    GasTankProps,
    GasTanksType,
    ZeroWalletProvidersType
} from '../types';
import { configEnv } from '../utils/global';

configEnv();

const test = anyTest as TestFn<{
    zeroWallet: ZeroWallet;
    providers: ZeroWalletProvidersType;
    gasTanks: GasTanksType;
    testApiKey: string;
    address: string;
}>;
test.serial.beforeEach(async (t) => {
    t.context.address = '0x0000000000000000000000000000000000000000';
    //  t.context.zeroWallet = new ZeroWallet('./testing.yml');
});
test.serial(
    'Create Zero Wallet and check addAuthorizedUser and doesUserExist functions',
    async (t) => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');

        t.deepEqual(await gasTank.doesUserExist(t.context.address), false);
        await gasTank.addAuthorizedUser(t.context.address);
        t.deepEqual(await gasTank.doesUserExist(t.context.address), true);
    }
);

test.serial('Create Zero Wallet and check deleteUser function', async (t) => {
    const zeroWallet = new ZeroWallet('./testing.yml');
    const gasTank = zeroWallet.getGasTank('testGasTankName');

    await gasTank.addAuthorizedUser(t.context.address);
    await gasTank.deleteUser(t.context.address);
    t.deepEqual(await gasTank.doesUserExist(t.context.address), false);
});
test.serial(
    'Create Zero Wallet and check isInWhiteList function',
    async (t) => {
        const zeroWallet = new ZeroWallet('./testing.yml');
        const gasTank = zeroWallet.getGasTank('testGasTankName');

        const contractAddress = 'contract-address';
        const contractAddress2 = 'contract-address2';
        t.deepEqual(await gasTank.isInWhiteList(contractAddress2), false);
        t.deepEqual(await gasTank.isInWhiteList(contractAddress), true);
    }
);
test.serial('Create Zero Wallet and check getNonce function', async (t) => {
    const zeroWallet = new ZeroWallet('./testing.yml');
    const gasTank = zeroWallet.getGasTank('testGasTankName');

    await gasTank.addAuthorizedUser(t.context.address);
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    console.log('characters', characters);
    const nonce = await gasTank.getNonce(t.context.address);

    console.log('characters', characters);
    t.deepEqual(typeof nonce, 'string');
    if (typeof nonce !== 'string') {
        return;
    }
    console.log('characters', characters);
    t.deepEqual(nonce.length, 100);

    console.log('characters', characters);
    for (let i = 0; i < nonce.length; i++) {
        t.deepEqual(characters.includes(nonce[i]), true);
    }
});
