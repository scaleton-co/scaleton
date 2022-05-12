import MAINNET_PAIRS from '../../../static/pairs/mainnet.yaml';
import TESTNET_PAIRS from '../../../static/pairs/testnet.yaml';
import { IS_TESTNET } from '../../ton/network';
import { PairCatalog } from './PairCatalog';

export const pairCatalog = new PairCatalog(IS_TESTNET ? TESTNET_PAIRS : MAINNET_PAIRS);
