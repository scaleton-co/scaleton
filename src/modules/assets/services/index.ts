import { TonClient } from 'ton';
import MAINNET_ASSETS from '../../../static/assets/mainnet.yaml';
import TESTNET_ASSETS from '../../../static/assets/testnet.yaml';
import { IS_TESTNET } from '../../ton/network';
import { walletService } from '../../wallet/services/WalletService';
import { AssetCatalog } from './AssetCatalog';
import { JettonAssetAdapter } from './adapters/JettonAssetAdapter';
import { NativeAssetAdapter } from './adapters/NativeAssetAdapter';
import { LocalStorageAssetStore } from './stores/LocalStorageAssetStore';

export const assetStore = new LocalStorageAssetStore(
  IS_TESTNET
    ? 'assets:testnet'
    : 'assets:mainnet'
);

export const tonClient = IS_TESTNET
  ? new TonClient({
    endpoint: process.env.REACT_APP_TON_API_TESTNET_URL!,
    apiKey: process.env.REACT_APP_TON_API_TESTNET_API_KEY,
  })
  : new TonClient({
    endpoint: process.env.REACT_APP_TON_API_MAINNET_URL!,
    apiKey: process.env.REACT_APP_TON_API_MAINNET_API_KEY,
  });

const standardAssets = IS_TESTNET ? TESTNET_ASSETS : MAINNET_ASSETS;

export const assetCatalog = new AssetCatalog(assetStore, standardAssets);

assetCatalog.registerAdapter('native', new NativeAssetAdapter(tonClient, walletService));
assetCatalog.registerAdapter('jetton', new JettonAssetAdapter(tonClient, walletService));
