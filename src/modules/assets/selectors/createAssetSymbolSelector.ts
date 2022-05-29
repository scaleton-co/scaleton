import { RootState } from '../../../store';

export function createAssetSymbolSelector(assetId: string) {
  return (state: RootState) => state.assets.assets.find((asset) => asset.id === assetId)?.symbol ?? null;
}
