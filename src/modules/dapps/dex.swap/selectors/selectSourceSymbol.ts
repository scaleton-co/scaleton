import { assetCatalog } from '../../../assets/services';
import type { RootState } from '../../../../store';

export function selectSourceSymbol(state: RootState) {
  return state.dex.swap.sourceId
    ? assetCatalog.getAsset(state.dex.swap.sourceId)?.symbol ?? null
    : null;
}
