import * as Sentry from '@sentry/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CURRENT_NETWORK } from './modules/ton/network';
import { store } from './store';
import 'antd/dist/antd.css';
import './index.scss';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: CURRENT_NETWORK,
  autoSessionTracking: true,
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
