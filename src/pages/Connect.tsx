import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { ConnectWalletView } from '../modules/wallet/pages/ConnectWalletView';

export function Connect() {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);
  const location = useLocation();

  if (walletAddress) {
    return <Navigate to={`/${walletAddress}/assets`} />;
  }

  if (!location.pathname.startsWith('/connect')) {
    return <Navigate to="/connect" />;
  }

  return <ConnectWalletView />;
}
