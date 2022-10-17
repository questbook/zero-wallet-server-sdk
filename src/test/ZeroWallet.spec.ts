import anyTest, { TestFn } from 'ava';
import { ethers } from 'ethers';

import { GasTank } from '../lib/GasTank';
import { ZeroWallet } from '../lib/ZeroWallet';
import { DatabaseConfig, GasTankProps, GasTanksType, ZeroWalletProvidersType } from '../types';
import { configEnv } from '../utils/global';

configEnv();

const test = anyTest as TestFn<{
    zeroWallet: ZeroWallet;
    providers: ZeroWalletProvidersType;
    gasTanks: GasTanksType;
    testApiKey: string;
}>;

test.beforeEach((t) => {
    t.context.providers = {
        5: new ethers.providers.JsonRpcProvider(
            `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
        )
    } as ZeroWalletProvidersType;

    t.context.testApiKey = process.env.TEST_API_KEY ?? 'TEST_API_KEY';
    t.context.gasTanks = [
        {
            name: 'testGasTankName',
            apiKey: t.context.testApiKey,
            fundingKey: 'testFundingKey',
            chainId: 5,
            provider: t.context.providers[5]
        }
    ] as GasTanksType;

    t.context.zeroWallet = new ZeroWallet({} as DatabaseConfig, t.context.gasTanks);
});

test('Create Zero Wallet and check gastank getter', async (t) => {
    t.deepEqual(
        t.context.zeroWallet.getGasTank(t.context.testApiKey),
        new GasTank(t.context.gasTanks[0], {} as DatabaseConfig)
    );
});

test('Create Zero Wallet and check gastank setter', async (t) => {
    const newGasTank: GasTankProps = {
        name: 'newTestDappName',
        apiKey: t.context.testApiKey,
        fundingKey: 'newTestFundingKey',
        chainId: 5,
        provider: t.context.providers[5]
    };

    t.context.zeroWallet.addGasTank(newGasTank);

    t.deepEqual(
        t.context.zeroWallet.getGasTank(t.context.testApiKey),
        new GasTank(newGasTank, {} as DatabaseConfig)
    );
});
