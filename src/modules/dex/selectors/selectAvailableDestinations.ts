import { assetCatalog } from '../../assets/services';
import { pairCatalog } from '../services';
import type { RootState } from '../../../store';
import type { AssetRef } from '../../assets/types/AssetRef';

export function selectAvailableDestinations(state: RootState) {
  const { sourceId } = state.dex.swap;

  return pairCatalog
    .getPairsByAsset(sourceId)
    .map(pair => assetCatalog.getById(pair.leftAssetId !== sourceId ? pair.leftAssetId : pair.rightAssetId))
    .filter(asset => !!asset) as AssetRef[];
}
