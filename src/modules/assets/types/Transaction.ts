import type { Big } from 'big.js';
import type BN from 'bn.js';
import type { Address } from 'ton';
import { TransactionType } from './TransactionType';

export interface Transaction {
  queryId: BN;
  time: Date;
  operation: TransactionType;
  from: Address | null;
  to: Address | null;
  amount: Big;
  comment: string | null;
  body: Buffer | null;
}
