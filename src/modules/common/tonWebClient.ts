import TonWeb from 'tonweb';
import { API_URLS } from './index';
import { CURRENT_NETWORK } from './network';

export const tonWebClient = new TonWeb.HttpProvider(
  `${API_URLS[CURRENT_NETWORK]}/v1/jsonRPC`,
);
