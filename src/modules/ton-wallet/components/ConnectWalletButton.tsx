import { WalletOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { connectWallet } from '../store';

export function ConnectWalletButton(props: ButtonProps) {
  const dispatch = useAppDispatch();
  const isConnecting = useAppSelector(state => state.wallet.isConnecting);

  const handleConnect = useCallback(
    () => dispatch(connectWallet()),
    [dispatch],
  );

  return (
    <Button
      type="primary"
      icon={<WalletOutlined/>}
      onClick={handleConnect}
      loading={isConnecting}
      {...props}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}
