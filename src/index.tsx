import * as Sentry from '@sentry/react';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { TonhubConnector } from 'ton-x';
import App from './App';
import { tonClient } from './modules/assets/services';
import { CURRENT_NETWORK, isMainnet, isSandbox, isTestnet } from './modules/common/network';
import { TonWalletWalletAdapter } from './modules/wallets/ton-wallet/TonWalletWalletAdapter';
import { TonkeeperWalletAdapter } from './modules/wallets/tonkeeper/TonkeeperWalletAdapter';
import { TonhubWalletAdapter } from './modules/wallets/tonhub/TonhubWalletAdapter';
import { TonWalletClient } from './modules/wallets/ton-wallet/TonWalletClient';

import { walletService } from './modules/wallets/common/WalletService';
import { store } from './store';
import 'antd/dist/antd.css';
import './index.scss';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: CURRENT_NETWORK,
  autoSessionTracking: true,
});

if (isMainnet() || isTestnet()) {
  walletService.registerAdapter('tonkeeper', new TonkeeperWalletAdapter(store));
}

if (!isMobile) {
  walletService.registerAdapter('ton-wallet', new TonWalletWalletAdapter(tonClient, new TonWalletClient(window)));
}

if (isMainnet() || isSandbox()) {
  walletService.registerAdapter('tonhub', new TonhubWalletAdapter(
    tonClient,
    new TonhubConnector({ testnet: isSandbox() }),
  ));
}

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
