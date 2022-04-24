import { Menu } from 'antd';
import React, { useCallback } from 'react';
import { useAppDispatch } from '../../../hooks';
import { disconnectWallet } from '../../ton-wallet/store';

export function NavBarWalletMenu() {
  const dispatch = useAppDispatch();

  const handleDisconnect = useCallback(
    () => dispatch(disconnectWallet()),
    [dispatch],
  );

  return (
    <Menu theme="dark">
      <Menu.Item key="disconnect" onClick={handleDisconnect}>Disconnect</Menu.Item>
    </Menu>
  );
}
