import { Big } from 'big.js';
import { Address } from 'ton';
import { AssetRef, Transaction } from '../types';

export interface AssetAdapter {
  getBalance(ownerAddress: Address, asset: AssetRef): Promise<Big>;
  getTransactions(ownerAddress: Address, asset: AssetRef): Promise<Transaction[]>;
}
