import type { RootState } from '../../../store';

export const selectWalletName = (state: RootState) => {
  switch (state.wallet.adapterId) {
    case 'ton-wallet': return 'TON Wallet';
    case 'tonhub': return 'Tonhub';
    default: return null;
  }
};
