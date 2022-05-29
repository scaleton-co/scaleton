import { assetCatalog } from '../services';

export function createAssetSelector(assetId: string) {
  return () => assetId
    ? assetCatalog.getAsset(assetId)
    : null;
}
