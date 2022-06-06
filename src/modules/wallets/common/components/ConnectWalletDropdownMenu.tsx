import { Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { isMobile } from 'react-device-detect';
import { WalletIcon } from './WalletIcon/WalletIcon';
import { isMainnet, isSandbox, isTestnet } from '../../../common/network';

export function ConnectWalletDropdownMenu({
  handleConnectTonkeeper,
  handleConnectTonhub,
  handleConnectTonWallet,
  theme,
}: {
  handleConnectTonkeeper?: () => void;
  handleConnectTonhub?: () => void;
  handleConnectTonWallet?: () => void;
  theme?: MenuTheme;
}) {
  const wallets: ItemType[] = [];

  if (isMainnet() || isTestnet()) {
    wallets.push({
      key: 'tonkeeper',
      label: 'Tonkeeper',
      icon: <WalletIcon wallet="tonkeeper"/>,
      onClick: handleConnectTonkeeper,
    });

    if (!isMobile) {
      wallets.push({
        key: 'ton-wallet',
        label: 'TON Wallet',
        icon: <WalletIcon wallet="ton-wallet"/>,
        onClick: handleConnectTonWallet,
      });
    }
  }

  if (isMainnet() || isSandbox()) {
    wallets.push({
      key: 'tonhub',
      label: isSandbox() ? 'Sandbox' : 'Tonhub',
      icon: <WalletIcon wallet={isSandbox() ? 'sandbox' : 'tonhub'}/>,
      onClick: handleConnectTonhub,
    });
  }

  return (
    <Menu theme={theme} items={wallets}/>
  );
}
