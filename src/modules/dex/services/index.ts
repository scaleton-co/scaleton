import MAINNET_PAIRS from '../../../static/pairs/mainnet.yaml';
import TESTNET_PAIRS from '../../../static/pairs/testnet.yaml';
import SANDBOX_PAIRS from '../../../static/pairs/sandbox.yaml';
import { CURRENT_NETWORK, Network } from '../../ton/network';
import { PairCatalog } from './PairCatalog';

const ALL_PAIRS = {
  [Network.MAINNET]: MAINNET_PAIRS,
  [Network.TESTNET]: TESTNET_PAIRS,
  [Network.SANDBOX]: SANDBOX_PAIRS,
};

export const pairCatalog = new PairCatalog(ALL_PAIRS[CURRENT_NETWORK]);
