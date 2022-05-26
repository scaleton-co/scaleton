import { Big } from 'big.js';
import BN from 'bn.js';
import { Address, Cell, TonClient } from 'ton';
import { PoolContract } from '../../../contracts/PoolContract';
import { TradeDirection } from '../../../contracts/enums/TradeDirection';
import { TransactionRequest } from '../../../wallet/services/TransactionRequest';
import { WalletService } from '../../../wallet/services/WalletService';
import { AssetRef } from '../../types/AssetRef';
import { JettonRef } from '../../types/JettonRef';
import { Transaction } from '../../types/Transaction';
import { AssetAdapter } from '../AssetAdapter';

export class NativeAssetAdapter implements AssetAdapter {
  constructor(
    private readonly tonClient: TonClient,
    private readonly walletService: WalletService,
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
        if (!transaction.inMessage.source) {
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
          })),
        );

        result.reverse();

        return result;
      })
      .flat()
      .filter(transaction => !!transaction) as Transaction[];
  }

  async requestTransaction<S>(
    adapterId: string,
    session: S,
    asset: AssetRef,
    request: TransactionRequest,
  ): Promise<void> {
    await this.walletService.requestTransaction(adapterId, session, request);
  }

  async requestSwap<S>(
    adapterId: string,
    session: S,
    asset: JettonRef,
    poolContractAddress: Address,
    tradeDirection: TradeDirection,
    sourceAmountIn: BN | number,
    minimumAmountOut: BN | number = 0,
    queryId: BN | number = 0,
  ): Promise<void> {
    const poolContract = new PoolContract(this.tonClient, null as any, poolContractAddress);
    const swapRequest = poolContract.createSwapNativeRequest(tradeDirection, minimumAmountOut, queryId);

    await this.walletService.requestTransaction(
      adapterId,
      session,
      {
        to: poolContract.address.toFriendly(),
        value: sourceAmountIn.toString(10),
        timeout: 2 * 60 * 1000,
        payload: swapRequest,
      },
    );
  }
}
