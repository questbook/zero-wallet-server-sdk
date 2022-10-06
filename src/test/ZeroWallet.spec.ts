import test from 'ava';

import { ethers } from 'ethers';
import { ZeroWallet } from '../lib/ZeroWallet';

test('Create Zero Wallet and retrieve a provider', async (t) => {

  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  
  const zeroWallet = new ZeroWallet({
    5: provider
  });

  t.is(zeroWallet.getProvider(5), provider);

});
