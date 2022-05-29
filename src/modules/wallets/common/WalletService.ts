import { Wallet } from './Wallet';
import { WalletAdapter } from './WalletAdapter';

export class WalletService {
  private readonly adapters: Map<string, WalletAdapter<any>> = new Map();

  registerAdapter(adapterId: string, adapter: WalletAdapter<any>) {
    this.adapters.set(adapterId, adapter);
  }

  createSession<S>(adapterId: string): Promise<S> {
    const adapter = this.adapters.get(adapterId) as WalletAdapter<S>;
    return adapter.createSession();
  }

  async awaitReadiness<S>(adapterId: string, session: S): Promise<Wallet> {
    const adapter = this.adapters.get(adapterId) as WalletAdapter<S>;
    return adapter.awaitReadiness(session);
  }

  async getWallet<S>(adapterId: string, session: S): Promise<Wallet> {
    const adapter = this.adapters.get(adapterId) as WalletAdapter<S>;
    return adapter.getWallet(session);
  }

  getWalletAdapter<S>(adapterId: string): WalletAdapter<S> {
    const adapter = this.adapters.get(adapterId) as WalletAdapter<S>;

    if (!adapter) {
      throw new Error('Wallet adapter is not registered.');
    }

    return adapter;
  }
}

export const walletService = new WalletService();
