import { TonClient } from 'ton';
import MAINNET_ASSETS from '../../../static/assets/mainnet.yaml';
import TESTNET_ASSETS from '../../../static/assets/testnet.yaml';
import SANDBOX_ASSETS from '../../../static/assets/sandbox.yaml';
import { API_URLS } from '../../common';
import { CURRENT_NETWORK, Network } from '../../ton/network';
import { walletService } from '../../wallet/services/WalletService';
import { AssetCatalog } from './AssetCatalog';
import { JettonAssetAdapter } from './adapters/JettonAssetAdapter';
import { NativeAssetAdapter } from './adapters/NativeAssetAdapter';
import { LocalStorageAssetStore } from './stores/LocalStorageAssetStore';

const ALL_ASSETS = {
  [Network.MAINNET]: MAINNET_ASSETS,
  [Network.TESTNET]: TESTNET_ASSETS,
  [Network.SANDBOX]: SANDBOX_ASSETS,
};

export const tonClient = new TonClient({
  endpoint: `${API_URLS[CURRENT_NETWORK]}/v1/jsonRPC`,
});

export const assetStore = new LocalStorageAssetStore(`assets:${CURRENT_NETWORK}`);
export const assetCatalog = new AssetCatalog(assetStore, ALL_ASSETS[CURRENT_NETWORK]);

assetCatalog.registerAdapter('native', new NativeAssetAdapter(tonClient, walletService));
assetCatalog.registerAdapter('jetton', new JettonAssetAdapter(tonClient, walletService));
