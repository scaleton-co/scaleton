import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks';
import { SwapView } from '../modules/dex/pages/SwapView';
import { IS_TESTNET } from '../modules/ton/network';

export function Trade() {
  const walletAddress = useAppSelector(state => state.wallet.wallet?.address);

  if (!IS_TESTNET || !walletAddress) {
    return <Navigate to="/connect" />
  }

  return (
    <SwapView/>
  );
}
