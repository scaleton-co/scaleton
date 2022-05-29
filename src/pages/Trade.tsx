import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { SwapView } from '../modules/dapps/dex.swap/pages/SwapView';
import { isMainnet } from '../modules/common/network';
import { selectWalletAddress } from '../modules/wallets/common/selectors/selectWalletAddress';

export function Trade() {
  const walletAddress = useAppSelector(selectWalletAddress);

  if (isMainnet() || !walletAddress) {
    return <Navigate to="/connect" />
  }

  return (
    <SwapView/>
  );
}
