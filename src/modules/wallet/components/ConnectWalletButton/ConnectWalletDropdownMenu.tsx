import { Menu } from 'antd';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import React from 'react';
import { WalletIcon } from '../WalletIcon/WalletIcon';

export function ConnectWalletDropdownMenu({
  handleConnectTonhub,
  handleConnectTonWallet,
  theme,
}: {
  handleConnectTonhub?: () => void;
  handleConnectTonWallet?: () => void;
  theme?: MenuTheme;
}) {
  return (
    <Menu
      theme={theme}
      items={[
        {
          key: 'ton-wallet',
          label: 'TON Wallet',
          icon: <WalletIcon wallet="ton-wallet" />,
          onClick: handleConnectTonWallet,
        },
        {
          key: 'tonhub',
          label: 'Tonhub',
          icon: <WalletIcon wallet="tonhub" />,
          onClick: handleConnectTonhub,
        },
      ]}
    />
  );
}
