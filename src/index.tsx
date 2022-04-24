import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { IS_TESTNET } from './modules/ton/network';
import { store } from './store';
import 'antd/dist/antd.css';
import './index.scss';

ReactGA.initialize(
  IS_TESTNET ? process.env.REACT_APP_GA_TRACK_TESTNET! : process.env.REACT_APP_GA_TRACK_MAINNET!,
  {
    debug: process.env.NODE_ENV === 'development',
  },
);

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: IS_TESTNET ? 'testnet' : 'mainnet',
});

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
