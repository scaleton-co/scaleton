import type { RootState } from '../../../store';

export function selectDestinationAmountOut(state: RootState) {
  if (!state.dex.swap.sourceAmountIn) return '';
  if (!state.dex.swap.currentPrice) return '';

  return state.dex.swap.destinationAmountOut;
}
