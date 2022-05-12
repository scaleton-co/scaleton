import { Big } from 'big.js';
import type { RootState } from '../../../store';

export function selectImpactPrice(state: RootState) {
  const { currentPrice, sourceAmountIn, destinationAmountOut } = state.dex.swap;

  if (!currentPrice || !sourceAmountIn || !destinationAmountOut) {
    return null;
  }

  const exactQuote = new Big(currentPrice).mul(sourceAmountIn);

  if (exactQuote.eq(0)) {
    return 0;
  }

  return exactQuote.sub(destinationAmountOut).div(exactQuote).mul(100).round(2).toNumber();
}
