import { WalletOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import React from 'react';
import { ConnectWalletButton } from '../../../ton-wallet/components/ConnectWalletButton';
import { TON_WALLET_EXTENSION_URL } from '../../../ton-wallet/services/tonWalletClient';
import './ConnectWalletView.scss';

export function ConnectWalletView() {
  return (
    <div className="connect-wallet-view">
      <Result
        icon={<WalletOutlined/>}
        title="Connect your wallet to see your jettons!"
        subTitle={(
          <>It requires <a target="_blank" rel="noreferrer" href={TON_WALLET_EXTENSION_URL}>TON Wallet</a> 1.1.31
            extension or later.</>
        )}
        extra={
          <ConnectWalletButton className="connect-wallet-button" size="large" />
        }
      />
    </div>
  );
}
