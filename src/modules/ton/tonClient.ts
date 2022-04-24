import TonWeb from 'tonweb';
import { IS_TESTNET } from './network';

export const tonClient = IS_TESTNET
  ? new TonWeb.HttpProvider(process.env.REACT_APP_TON_API_TESTNET_URL, {
    apiKey: process.env.REACT_APP_TON_API_TESTNET_API_KEY,
  })
  : new TonWeb.HttpProvider(process.env.REACT_APP_TON_API_MAINNET_URL, {
    apiKey: process.env.REACT_APP_TON_API_MAINNET_API_KEY,
  });
