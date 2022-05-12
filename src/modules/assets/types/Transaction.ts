import type { Big } from 'big.js';
import type BN from 'bn.js';
import type { Address } from 'ton';

export interface Transaction {
  queryId: BN;
  time: Date;
  operation: 'in' | 'out' | 'mint' | 'burn';
  from: Address | null;
  to: Address | null;
  amount: Big;
  comment: string | null;
}
