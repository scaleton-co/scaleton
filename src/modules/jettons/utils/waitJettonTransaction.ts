import { tonClient } from '../../ton/tonClient';
import { RawTransaction } from '../../ton/types/RawTransaction';
import { parseTransaction } from './parseTransaction';

export function waitJettonTransaction(
  jettonWallet: string,
  queryId: string,
  timeout: number = 60_000,
  checkInterval: number = 2000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error('Timeout exceeded.')),
      timeout,
    );

    const timerId = setInterval(
      async () => {
        const transactions: RawTransaction[] = await tonClient.getTransactions(jettonWallet);

        for (const transaction of transactions) {
          const tx = parseTransaction(transaction);

          if (tx?.queryId === queryId) {
            clearInterval(timerId);
            resolve();
            break;
          }
        }
      },
      checkInterval,
    );
  });
}
