import anyTest, { TestFn } from 'ava';
import { ethers } from 'ethers';

import { ZeroWallet } from '../lib/ZeroWallet';
import { GasTanks, ZeroWalletProviders } from '../types';

const test = anyTest as TestFn<{
  zeroWallet: ZeroWallet;
  providers: ZeroWalletProviders;
  gasTanks: GasTanks;
}>;

test.beforeEach((t) => {
  t.context.providers = {
    5: new ethers.providers.JsonRpcProvider('http://localhost:8545'),
  } as ZeroWalletProviders;

  t.context.gasTanks = {
    5: {
      dappName: 'testDappName',
      apiKey: 'testApiKey',
      fundingKey: 'testFundingKey',
    },
  } as GasTanks;

  t.context.zeroWallet = new ZeroWallet(
    t.context.providers,
    t.context.gasTanks
  );
});

test('Create Zero Wallet and check provider getter', async (t) => {
  t.is(t.context.zeroWallet.getProvider(5), t.context.providers[5]);
});

test('Create Zero Wallet and check gastank getter', async (t) => {
  t.is(t.context.zeroWallet.getGasTank(5), t.context.gasTanks[5]);
});

test('Create Zero Wallet and check gastank setter', async (t) => {
  const newGasTank = {
    dappName: 'newTestDappName',
    apiKey: 'newTestApiKey',
    fundingKey: 'newTestFundingKey',
  };

  t.context.zeroWallet.setGasTank(5, newGasTank);

  t.is(t.context.zeroWallet.getGasTank(5), newGasTank);
});

test('Create Zero Wallet and check provider setter', async (t) => {
  const newProvider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8546'
  );

  t.context.zeroWallet.setProvider(5, newProvider);

  t.is(t.context.zeroWallet.getProvider(5), newProvider);
});
