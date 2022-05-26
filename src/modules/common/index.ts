import axios from 'axios';
import { CURRENT_NETWORK, Network } from '../ton/network';

export const API_URLS = {
  [Network.MAINNET]: process.env.REACT_APP_API_MAINNET_URL!,
  [Network.TESTNET]: process.env.REACT_APP_API_TESTNET_URL!,
  [Network.SANDBOX]: process.env.REACT_APP_API_SANDBOX_URL!,
};

export const scaletonClient = axios.create({
  baseURL: API_URLS[CURRENT_NETWORK],
});
