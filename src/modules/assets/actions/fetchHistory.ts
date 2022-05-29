import { createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from 'ton';
import { assetCatalog } from '../services';
import { TransactionType } from '../types/TransactionType';

interface FetchHistoryInput {
  account: string;
  assetId: string;
}

interface Transaction {
  time: string;
  operation: TransactionType;
  from: string | null;
  to: string | null;
  amount: string;
  comment: string | null;
}

export const fetchHistory = createAsyncThunk<Transaction[], FetchHistoryInput>(
  'assets/fetchHistory',
  async (input, thunkAPI) => {
    const account = Address.parse(input.account);
    const transactions = await assetCatalog.getTransactions(account, input.assetId);

    return transactions.map(transaction => ({
      time: transaction.time.toISOString(),
      operation: transaction.operation,
      from: transaction.from?.toFriendly() ?? null,
      to: transaction.to?.toFriendly() ?? null,
      amount: transaction.amount.toString(),
      comment: transaction.comment,
    }));
  },
);
