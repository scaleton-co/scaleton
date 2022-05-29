import { RootState } from '../../../store';

export function createHistoryLoadingSelector(account: string, assetId: string) {
  return (state: RootState) => !!state.assets.history[assetId]?.isLoading ?? true
}
