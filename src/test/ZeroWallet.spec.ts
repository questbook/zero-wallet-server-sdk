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
  console.log(67);
  t.is(t.context.zeroWallet.getProvider(5), t.context.providers[5]);
});

test('Create Zero Wallet and check gastank getter', async (t) => {
  const provider = new ethers.providers.JsonRpcProvider(
    'http://localhost:8545'
  );

  const providers: ZeroWalletProviders = {
    5: provider,
  };

  const gasTanks: GasTanks = {
    5: {
      dappName: 'test',
      apiKey: 'test',
      fundingKey: 'test',
    },
  };

  const zeroWallet = new ZeroWallet(providers, gasTanks);

  t.is(zeroWallet.getGasTank(5), gasTanks[5]);
});
