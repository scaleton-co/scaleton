import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { SwapView } from '../modules/dex/pages/SwapView';
import { isMainnet } from '../modules/ton/network';

export function Trade() {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);

  if (isMainnet() || !walletAddress) {
    return <Navigate to="/connect" />
  }

  return (
    <SwapView/>
  );
}
