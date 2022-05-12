import { TonhubConnector } from 'ton-x';
import { IS_TESTNET } from '../../ton/network';
import { TransactionRequest } from './TransactionRequest';
import { Wallet } from './Wallet';
import { WalletAdapter } from './WalletAdapter';
import { TonWalletWalletAdapter } from './adapters/TonWalletWalletAdapter';
import { TonhubWalletAdapter } from './adapters/TonhubWalletAdapter';

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

  async requestTransaction<S>(adapterId: string, session: S, request: TransactionRequest): Promise<void> {
    const adapter = this.adapters.get(adapterId) as WalletAdapter<S>;
    await adapter.requestTransaction(session, request);
  }
}

export const walletService = new WalletService();

const tonhubConnector = new TonhubConnector({ testnet: IS_TESTNET });

walletService.registerAdapter('tonhub', new TonhubWalletAdapter(tonhubConnector));
walletService.registerAdapter('ton-wallet', new TonWalletWalletAdapter());
