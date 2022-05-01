import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import TonWeb from 'tonweb';
import { tonClient } from '../ton/tonClient';
import { walletService } from '../wallet/services/WalletService';
import { jettonV1 } from './contracts/JettonV1';
import { jettonWalletV1 } from './contracts/JettonWalletV1';
import { jettonCatalog } from './services/JettonCatalog';
import { parseTransaction } from './utils/parseTransaction';
import { waitJettonTransaction } from './utils/waitJettonTransaction';
import type { Jetton } from './types/Jetton';
import type { JettonTransaction } from './types/JettonTransaction';

type JettonWallet = {
  [jettonContract: string]: {
    wallet: string;
    balance: string;
  };
}

interface JettonsState {
  contracts: Jetton[];
  balancesLoading: boolean;
  balances: {
    [owner: string]: JettonWallet;
  };

  history: {
    [jettonWallet: string]: {
      transactions: JettonTransaction[];
      isLoading: boolean;
    };
  };
}

const initialState: JettonsState = {
  contracts: jettonCatalog.contracts,
  balancesLoading: false,
  balances: {},
  history: {},
};

export const importJetton = createAsyncThunk<void, Jetton>(
  'jettons/import',
  (jetton: Jetton) => {
    jettonCatalog.importJetton(jetton.address, jetton.name, jetton.symbol);
  },
);

export const refreshBalances = createAsyncThunk(
  'jettons/refreshBalances',
  async (owner: string) => {
    const result: JettonWallet = {};

    for (const contract of jettonCatalog.contracts) {
      try {
        const wallet = await jettonV1.getWalletAddress(contract.address, owner);
        const balance = await jettonWalletV1.getBalance(wallet);

        result[contract.address] = {
          wallet: wallet,
          balance: balance.toString(10),
        };
      } catch (error) {
        console.error('Cannot fetch balance.', error);
      }
    }

    return result;
  },
);

export const showTransactions = createAsyncThunk<JettonTransaction[], string>(
  'jettons/showTransactions',
  async (jettonWallet: string) => {
    const transactions = await tonClient.getTransactions(jettonWallet);

    return transactions
      .map(parseTransaction)
      .filter((transaction: any) => transaction !== null);
  },
);

interface SendJettonsInput {
  adapterId: string;
  session: unknown;
  jettonWallet: string;
  response?: string;
  recipient: string;
  amount: string;
  comment?: string;
}

export const sendJettons = createAsyncThunk<void, SendJettonsInput>(
  'jettons/send',
  async (input) => {
    const queryId = Math.round(
      Math.random() * Math.pow(2, 32)
    );

    await walletService.requestTransaction(
      input.adapterId,
      input.session,
      {
        to: input.jettonWallet,
        value: TonWeb.utils.toNano(0.035).toString(10),
        timeout: 2 * 60 * 1000,
        payload: jettonWalletV1
          .createTransferBody({
            queryId,
            jettonAmount: TonWeb.utils.toNano(input.amount),
            toAddress: input.recipient,
            forwardPayload: input.comment ? Buffer.from(input.comment.trim()) : undefined,
          })
          .toBoc(),
      }
    );

    await waitJettonTransaction(input.jettonWallet, queryId.toString(10));
  },
);

const store = createSlice({
  name: 'jettons',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(refreshBalances.pending, (state, action) => {
      state.balancesLoading = true;
    });

    builder.addCase(refreshBalances.fulfilled, (state, action) => {
      state.balancesLoading = false;
      state.balances[action.meta.arg] = action.payload;
    });

    builder.addCase(refreshBalances.rejected, (state, action) => {
      state.balancesLoading = false;
    });

    builder.addCase(showTransactions.pending, (state, action) => {
      const walletHistory = state.history[action.meta.arg];

      state.history[action.meta.arg] = {
        transactions: walletHistory?.transactions,
        isLoading: true,
      };
    });

    builder.addCase(showTransactions.fulfilled, (state, action) => {
      state.history[action.meta.arg] = {
        transactions: action.payload,
        isLoading: false,
      };
    });

    builder.addCase(showTransactions.rejected, (state, action) => {
      const walletHistory = state.history[action.meta.arg];

      state.history[action.meta.arg] = {
        transactions: walletHistory?.transactions,
        isLoading: false,
      };
    });

    builder.addCase(importJetton.fulfilled, (state, action) => {
      state.contracts.push(action.meta.arg);
    });
  }
});

export default store.reducer;
