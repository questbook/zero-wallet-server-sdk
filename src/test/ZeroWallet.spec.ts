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

test.beforeEach((t) => {
    t.context.testApiKey =  'TEST_API_KEY';
    t.context.gasTanks = [
        {
            name: 'testGasTankName',
            apiKey: t.context.testApiKey,
            chainId: 5,
            providerURL: `testingURL`
        }
    ] as GasTanksType;
});

// test('Create Zero Wallet and check gastank getter', async (t) => {
//     t.deepEqual(
//         t.context.zeroWallet.getGasTank(t.context.testApiKey),
//         new GasTank(t.context.gasTanks[0], {} as DatabaseConfig)
//     );
// });

test('Create Zero Wallet and check gasTank setter', async (t) => {
    const zeroWallet = new ZeroWallet('src/test/example.yml');
    const gasTank = zeroWallet.getGasTank('testApiKey');

    t.deepEqual(gasTank, t.context.gasTanks[0]);
});
