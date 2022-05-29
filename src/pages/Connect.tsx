import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { ConnectWalletView } from '../modules/wallets/common/pages/ConnectWalletView';
import { selectWalletAddress } from '../modules/wallets/common/selectors/selectWalletAddress';

export function Connect() {
  const walletAddress = useAppSelector(selectWalletAddress);
  const location = useLocation();

  if (walletAddress) {
    return <Navigate to={`/${walletAddress}/assets`} />;
  }

  if (!location.pathname.startsWith('/connect')) {
    return <Navigate to="/connect" />;
  }

  return <ConnectWalletView />;
}
