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
}>;
test('Create Zero Wallet and check addAuthorizedUser and doesUserExist', async (t) => {
    const zeroWallet = new ZeroWallet('./testing.yml');
    const gasTank = zeroWallet.getGasTank('testGasTankName');
    const address = '0x0000000000000000000000000000000000000000';
    t.deepEqual(await gasTank.doesUserExist(address), false);
    await gasTank.addAuthorizedUser(address);
    t.deepEqual(await gasTank.doesUserExist(address), true);
    t.deepEqual(true,true);
});

