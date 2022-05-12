import { Big } from 'big.js';
import { Address } from 'ton';
import { AssetRef } from '../types/AssetRef';
import { Transaction } from '../types/Transaction';
import { TransactionRequest } from "../../wallet/services/TransactionRequest";
import BN from "bn.js";
import { TradeDirection } from "../../contracts/enums/TradeDirection";

export interface AssetAdapter {
  getBalance(ownerAddress: Address, asset: AssetRef): Promise<Big>;

  getTransactions(ownerAddress: Address, asset: AssetRef): Promise<Transaction[]>;

  requestTransaction<S>(adapterId: string, session: S, asset: AssetRef, request: TransactionRequest): Promise<void>;

  requestSwap<S>(
    adapterId: string,
    session: S,
    asset: AssetRef,
    poolContractAddress: Address,
    tradeDirection: TradeDirection,
    sourceAmountIn: BN | number,
    minimumAmountOut: BN | number,
    queryId: BN | number,
  ): Promise<void>;
}
