import { assetCatalog } from '../../../assets/services';
import type { RootState } from '../../../../store';

export function selectDestinationSymbol(state: RootState) {
  return state.dex.swap.destinationId
    ? assetCatalog.getAsset(state.dex.swap.destinationId)?.symbol ?? null
    : null;
}
