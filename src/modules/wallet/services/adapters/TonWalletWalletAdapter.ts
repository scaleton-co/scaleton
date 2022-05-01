import { TON_WALLET_EXTENSION_URL, tonWalletClient } from '../../../ton-wallet/services/tonWalletClient';
import { TransactionRequest } from '../TransactionRequest';
import { Wallet } from '../Wallet';
import { WalletAdapter } from '../WalletAdapter';

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class TonWalletWalletAdapter implements WalletAdapter<boolean> {
  async createSession(): Promise<boolean> {
    try {
      await tonWalletClient.ready(150);
      return true;
    } catch (error) {
      window.open(TON_WALLET_EXTENSION_URL, '_blank');
      throw error;
    }
  }

  async awaitReadiness(session: any): Promise<Wallet> {
    await tonWalletClient.ready();

    const [[wallet]] = await Promise.all([
      tonWalletClient.requestWallets(),
      delay(150),
    ]);

    if (!wallet) {
      throw new Error('TON Wallet is not configured.');
    }

    return wallet;
  }

  isAvailable(): boolean {
    return !!window.ton?.isTonWallet;
  }

  async requestTransaction(session: any, request: TransactionRequest): Promise<void> {
    await Promise.race([
      tonWalletClient.sendTransaction({
        to: request.to,
        value: request.to,
        dataType: request.payload ? 'boc' : 'text',
        data: request.payload?.toString('base64') ?? request.text ?? undefined,
        stateInit: request.stateInit?.toString('base64'),
      }),
      timeout(request.timeout, 'Transaction request exceeded timeout.'),
    ]);
  }
}

function timeout(ms: number, message: string) {
  return new Promise((_, reject) => setTimeout(
    () => reject(new Error(message)),
    ms,
  ));
}
