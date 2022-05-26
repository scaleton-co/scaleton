import TonWeb from 'tonweb';
import { API_URLS } from '../common';
import { CURRENT_NETWORK } from './network';

export const tonClient = new TonWeb.HttpProvider(
  `${API_URLS[CURRENT_NETWORK]}/v1/jsonRPC`,
);
