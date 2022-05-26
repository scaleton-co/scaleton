import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Address, toNano } from 'ton';
import { assetCatalog } from '../assets/services';
import type { RootState } from '../../store';
import type { AssetRef } from '../assets/types/AssetRef';
import type { Jetton } from './types/Jetton';

type AssetBalances = {
  [assetId: string]: {
    balance: string;
  };
}

interface JettonsState {
  assets: AssetRef[];
  balancesLoading: boolean;
  balances: {
    [owner: string]: AssetBalances;
  };

  history: {
    [assetId: string]: {
      transactions: {
        time: string;
        operation: 'in' | 'out' | 'mint' | 'burn';
        from: string | null;
        to: string | null;
        amount: string;
        comment: string | null;
      }[];
      isLoading: boolean;
    };
  };
}

const initialState: JettonsState = {
  assets: assetCatalog.getAll(),
  balancesLoading: false,
  balances: {},
  history: {},
};

export const importJetton = createAsyncThunk<AssetRef[], Jetton>(
  'jettons/import',
  (jetton: Jetton) => {
    assetCatalog.importJetton({
      name: jetton.name,
      symbol: jetton.symbol ?? jetton.name,
      contractAddress: jetton.address,
    });

    return assetCatalog.getAll();
  },
);

export const hideAsset = createAsyncThunk<AssetRef[], string>(
  'jettons/hideAsset',
  async (assetId: string) => {
    assetCatalog.removeAsset(assetId);

    return assetCatalog.getAll();
  },
);

export const refreshBalances = createAsyncThunk(
  'jettons/refreshBalances',
  async (owner: string) => {
    const result: AssetBalances = {};

    const ownerAddress = Address.parse(owner);
    const assets = assetCatalog.getAll();

    await Promise.all(
      assets.map(async (asset) => {
        try {
          const balance = await assetCatalog.getBalance(ownerAddress, asset.id);

          result[asset.id] = {
            // wallet: '', // TODO <--
            balance: balance.toString(),
          };
        } catch (e) {
          console.error(e);
        }
      }),
    );

    return result;
  },
);

// export const showTransactions = createAsyncThunk<JettonTransaction[], string>(
export const showTransactions = createAsyncThunk(
  'jettons/showTransactions',
  async (assetId: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const ownerAddress = Address.parse(state.wallet.wallet!.address);
    const transactions = await assetCatalog.getTransactions(ownerAddress, assetId);

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

interface SendJettonsInput {
  adapterId: string;
  session: unknown;
  assetId: string;
  response?: string;
  recipient: string;
  amount: string;
  comment?: string;
}

export const sendAssets = createAsyncThunk<void, SendJettonsInput>(
  'jettons/send',
  async (input) => {
    await assetCatalog.requestTransaction(
      input.adapterId,
      input.session,
      input.assetId,
      {
        to: input.recipient,
        value: toNano(input.amount).toString(),
        timeout: 2 * 60 * 1000,
        text: input.comment?.trim(),
      },
    );

    // TODO: Extract it to a separate action.
    // await waitJettonTransaction(input.jettonWallet, queryId.toString(10));
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
      state.assets = action.payload;
    });

    builder.addCase(hideAsset.fulfilled, (state, action) => {
      state.assets = action.payload;
    });
  }
});

export default store.reducer;
