import type { RootState } from '../../../store';

export function createHistorySelector(account: string, assetId: string) {
  return (state: RootState) => state.assets.history[assetId]?.transactions || []
}
