import type { RootState } from '../../../../store';

export const selectWalletFeatures = (state: RootState) => state.wallets.common.features;
