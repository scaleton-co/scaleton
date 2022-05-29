import type { RootState } from '../../../../store';

export const selectWalletAddress = (state: RootState) => state.wallets.common.wallet?.address ?? null;
