import { Wallet } from './Wallet';
import { WalletFeature } from './WalletFeature';

export interface WalletAdapter<S> {
  readonly features: WalletFeature[];

  isAvailable(): boolean;
  createSession(): Promise<S>;
  awaitReadiness(session: S): Promise<Wallet>;
  getWallet(session: S): Promise<Wallet>;

  requestTransfer(
    session: S,
    destination: string,
    amount: string,
    comment: string,
    timeout: number,
  ): Promise<void>;

  requestJettonTransfer(
    session: S,
    contractAddress: string,
    destination: string,
    amount: string,
    forwardPayload: string,
    requestTimeout: number,
    forwardAmount?: number,
    gasFee?: number,
  ): Promise<void>;
}
