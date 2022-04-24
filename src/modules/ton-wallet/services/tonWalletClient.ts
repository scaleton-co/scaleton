import { Wallet } from '../types/Wallet';

export const TON_WALLET_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd';

export interface TonWalletProvider {
  isTonWallet: boolean;
  send(method: string, params?: any[]): Promise<any>;
  on(eventName: string, handler: (...data: any[]) => any): void;
}

declare global {
  interface Window {
    ton?: TonWalletProvider;
  }
}

export class TonWalletClient {
  constructor(
    private readonly window: Window,
  ) {
  }

  private get ton(): TonWalletProvider | undefined {
    return this.window.ton;
  }

  get isAvailable(): boolean {
    return !!this.ton?.isTonWallet;
  }

  ready(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timerId = setInterval(
        () => {
          if (this.isAvailable) {
            clearInterval(timerId);
            resolve();
          }
        },
        100,
      );

      setTimeout(
        () => reject(new Error('TON Wallet cannot be initialized')),
        5000,
      );
    });
  }

  getBalance(): Promise<string | null> {
    return this.ton!.send('ton_getBalance');
  }

  requestAccounts(): Promise<string[]> {
    return this.ton!.send('ton_requestAccounts');
  }

  requestWallets(): Promise<Wallet[]> {
    return this.ton!.send('ton_requestWallets');
  }

  watchAccounts(callback: (accounts: string[]) => void): void {
    this.ton!.on('ton_requestAccounts', callback);
  }

  sign(hexData: string): Promise<string> {
    return this.ton!.send('ton_rawSign', [
      { data: hexData },
    ]);
  }

  sendTransaction(options: {
    to: string,
    value: string,
    data?: string,
    dataType?: 'boc' | 'hex' | 'base64' | 'text',
    stateInit?: string,
  }): Promise<void> {
    return this.ton!.send('ton_sendTransaction', [options]);
  }
}

export const tonWalletClient = new TonWalletClient(window);
