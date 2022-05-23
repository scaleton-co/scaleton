import { WalletOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import React from 'react';
import { TON_WALLET_EXTENSION_URL } from '../../ton-wallet/services/tonWalletClient';
import { ConnectWalletButton } from '../components/ConnectWalletButton/ConnectWalletButton';
import './ConnectWalletView.scss';

export function ConnectWalletView() {
  return (
    <div className="connect-wallet-view">
      <Result
        icon={<WalletOutlined/>}
        title="Connect your wallet to see your assets!"
        subTitle={(
          <>
            It requires <a target="_blank" rel="noreferrer" href={TON_WALLET_EXTENSION_URL}>TON Wallet</a> extension
            or <a target="_blank" rel="noreferrer" href="https://tonhub.com">Tonhub</a>.
          </>
        )}
        extra={
          <ConnectWalletButton theme="dark" className="connect-wallet-button" size="large" />
        }
      />
    </div>
  );
}
