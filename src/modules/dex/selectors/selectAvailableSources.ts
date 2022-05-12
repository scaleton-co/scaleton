import { assetCatalog } from '../../assets/services';
import { pairCatalog } from '../services';

export function selectAvailableSources() {
  return assetCatalog
    .getAll()
    .filter(asset => pairCatalog.getPairsByAsset(asset.id).length > 0);
}

