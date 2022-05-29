import type { RootState } from '../../../../store';

export const selectWalletName = (state: RootState) => {
  switch (state.wallets.common.adapterId) {
    case 'ton-wallet': return 'TON Wallet';
    case 'tonhub': return 'Tonhub';
    case 'tonkeeper': return 'Tonkeeper';
    default: return null;
  }
};
