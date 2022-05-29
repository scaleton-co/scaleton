import axios from 'axios';
import { Store } from 'redux';
import { backoff } from 'ton-x/dist/utils/backoff';
import { Wallet } from '../common/Wallet';
import { WalletAdapter } from '../common/WalletAdapter';
import { delay } from '../ton-wallet/TonWalletWalletAdapter';
import { requestTransfer } from './actions/requestTransfer';
import { WalletFeature } from '../common/WalletFeature';
import { API_URLS, scaletonClient } from '../../common';
import { CURRENT_NETWORK } from '../../common/network';
import { DEFAULT_JETTON_GAS_FEE } from '../common/constants';
import { preloadImage } from '../../common/utils/preloadImage';
import tonkeeperIcon from '../common/components/WalletIcon/icons/tonkeeper.svg';

export type TonkeeperSession = {
  sessionId: string;
  link: string;
};

const TONKEEPER_TIMEOUT = 5 * 60 * 1000;

export class TonkeeperWalletAdapter implements WalletAdapter<TonkeeperSession> {
  readonly features: WalletFeature[] = [];

  constructor(
    private readonly store: Store,
  ) {
    preloadImage(tonkeeperIcon);
  }

  async createSession(): Promise<TonkeeperSession> {
    const apiUrl = API_URLS[CURRENT_NETWORK];

    const { data: session } = await axios.post(`${apiUrl}/v1/sessions`);

    const connectLink = `${apiUrl}/v1/sessions/${session.id}/init`
      .replace(/^https?:\/\//, 'https://app.tonkeeper.com/ton-login/');

    return {
      sessionId: session.id,
      link: connectLink,
    };
  }

  async awaitReadiness(session: TonkeeperSession): Promise<Wallet> {
    const expires = Date.now() + TONKEEPER_TIMEOUT;

    const state = await backoff(async () => {
      while (Date.now() < expires) {
        const { data: existing } = await scaletonClient.get(`/v1/sessions/${session.sessionId}`);

        if (existing.state === 'ready') {
          return existing;
        }

        await delay(1000);
      }

      return { state: 'expired' };
    });

    if (state.state === 'expired') {
      throw new Error('Connection was not confirmed.');
    }

    return {
      address: state.address,
      publicKey: state.publicKey,
      walletVersion: state.walletVersion,
    };
  }

  getWallet(session: TonkeeperSession): Promise<Wallet> {
    return this.awaitReadiness(session);
  }

  isAvailable(): boolean {
    return false;
  }

  async requestTransfer(
    session: TonkeeperSession,
    destination: string,
    amount: string,
    comment: string,
    timeout: number,
  ): Promise<void> {
    const deeplink = `https://app.tonkeeper.com/transfer/${destination}?amount=${amount}&text=${encodeURIComponent(comment)}`;

    this.store.dispatch(
      requestTransfer({
        destination,
        amount,
        comment,
        deeplink,
      }) as any,
    );
  }

  async requestJettonTransfer(
    session: TonkeeperSession,
    contractAddress: string,
    destination: string,
    amount: string,
    forwardPayload: string,
    requestTimeout: number,
    forwardAmount: number = 0,
    gasFee: number = DEFAULT_JETTON_GAS_FEE,
  ): Promise<void> {
    throw new Error('Not supported.');
  }
}
