import { Big } from 'big.js';
import BN from 'bn.js';
import { Address, Cell, parseTransaction, TonClient } from 'ton';
import { AssetRef, Transaction } from '../../types';
import { AssetAdapter } from '../AssetAdapter';

export class NativeAssetAdapter implements AssetAdapter {
  constructor(
    private readonly tonClient: TonClient,
  ) {
  }

  async getBalance(ownerAddress: Address, asset: AssetRef): Promise<Big> {
    try {
      const balance = await this.tonClient.getBalance(ownerAddress);
      return new Big(balance.toString()).div(1_000_000_000);
    } catch {
      return new Big(0);
    }
  }

  async getTransactions(ownerAddress: Address, asset: AssetRef): Promise<Transaction[]> {
    const transactions = await this.tonClient.getTransactions(ownerAddress, {
      limit: 20,
    });

    const extractQueryId = (data?: Buffer): BN => {
      try {
        if (!data || !data.length) return new BN(0);

        const body = Cell.fromBoc(data)[0];
        const bodySlice = body.beginParse();

        bodySlice.skip(32);

        return bodySlice.readUint(64);
      } catch {
        return new BN(0);
      }
    }

    return transactions
      .map((transaction): Transaction[] | null => {
        if (!transaction.inMessage) return null;

        const time = new Date(transaction.time * 1000);

        const result: Transaction[] = [];

        // Note: Skip external messages of the wallet to hide "noise".
        if (transaction.inMessage.source) {
          const inMessageBody = parseTransaction(0, Cell.fromBoc(Buffer.from(transactions[0].data, 'base64'))[0].beginParse())
            .inMessage?.body.beginParse();

          result.push({
            queryId: new BN(0),
            time,
            operation: 'in',
            from: transaction.inMessage.source ?? null,
            to: transaction.inMessage.destination ?? null,
            amount: new Big(transaction.inMessage.value.toString()).div(1_000_000_000),
            comment: transaction.inMessage.body?.type === 'text'
              ? transaction.inMessage.body.text
              : null,
            body: inMessageBody?.readRemainingBytes() ?? null,
          });
        }

        result.push(
          ...transaction.outMessages.map((message): Transaction => ({
            queryId: message.body?.type === 'data' ? extractQueryId(message.body.data) : new BN(0),
            time,
            operation: 'out',
            from: message.source ?? null,
            to: message.destination ?? null,
            amount: new Big(message.value.toString()).div(1_000_000_000),
            comment: message.body?.type === 'text'
              ? message.body.text
              : null,
            body: null,
          })),
        );

        result.reverse();

        return result;
      })
      .flat()
      .filter(transaction => !!transaction) as Transaction[];
  }
}
