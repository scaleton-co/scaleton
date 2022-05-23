import { WalletOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Dropdown } from 'antd';
import React, { useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { createWalletSession } from '../../store';
import { ConnectWalletDropdownMenu } from './ConnectWalletDropdownMenu';
import type { MenuTheme } from 'antd/lib/menu/MenuContext';

export function ConnectWalletButton(props: ButtonProps & { theme?: MenuTheme }) {
  const [isVisible, setVisible] = useState(false);
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => !!state.wallet.session && !state.wallet.wallet);

  const handleConnectTonWallet = useCallback(
    () => {
      setVisible(false);
      dispatch(createWalletSession('ton-wallet'));
    },
    [dispatch],
  );

  const handleConnectTonhub = useCallback(
    () => {
      setVisible(false);
      dispatch(createWalletSession('tonhub'));
    },
    [dispatch]
  );

  return (
    <Dropdown
      visible={isVisible}
      onVisibleChange={setVisible}
      overlay={(
        <ConnectWalletDropdownMenu
          handleConnectTonhub={handleConnectTonhub}
          handleConnectTonWallet={handleConnectTonWallet}
          theme={props.theme}
        />
      )}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="primary"
        icon={<WalletOutlined/>}
        loading={isLoading}
        {...props}
      >
        <span className="connect-wallet-text">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
      </Button>
    </Dropdown>
  );
}
