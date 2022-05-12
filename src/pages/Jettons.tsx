import { Navigate, useLocation, useParams } from 'react-router-dom';
import { JettonWalletView } from '../modules/jettons/pages/JettonWalletView';

export function Jettons() {
  const location = useLocation();
  const { address } = useParams();

  if (location.pathname.startsWith('/address/')) {
    return <Navigate to={`/${address}/assets`} />;
  }

  return (
    <JettonWalletView/>
  );
}
