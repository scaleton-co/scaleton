import { createSlice } from '@reduxjs/toolkit';
import { fetchHistory, hideAsset, importJetton, refreshBalances } from './actions';
import { assetCatalog } from './services';
import { TransactionType } from './types/TransactionType';
import type { AssetBalances, AssetRef } from './types';

interface AssetsState {
  assets: AssetRef[];
  balancesLoading: boolean;
  balances: {
    [owner: string]: AssetBalances;
  };

  history: {
    [assetId: string]: {
      transactions: {
        time: string;
        operation: TransactionType;
        from: string | null;
        to: string | null;
        amount: string;
        comment: string | null;
      }[];
      isLoading: boolean;
    };
  };
}

const initialState: AssetsState = {
  assets: assetCatalog.getAssets(),
  balancesLoading: false,
  balances: {},
  history: {},
};

const store = createSlice({
  name: 'assets',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(refreshBalances.pending, (state) => {
      state.balancesLoading = true;
    });

    builder.addCase(refreshBalances.fulfilled, (state, action) => {
      state.balancesLoading = false;
      state.balances[action.meta.arg] = action.payload;
    });

    builder.addCase(refreshBalances.rejected, (state) => {
      state.balancesLoading = false;
    });

    builder.addCase(fetchHistory.pending, (state, action) => {
      const accountHistory = state.history[action.meta.arg.assetId];

      state.history[action.meta.arg.assetId] = {
        transactions: accountHistory?.transactions,
        isLoading: true,
      };
    });

    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.history[action.meta.arg.assetId] = {
        transactions: action.payload,
        isLoading: false,
      };
    });

    builder.addCase(fetchHistory.rejected, (state, action) => {
      const accountHistory = state.history[action.meta.arg.assetId];

      state.history[action.meta.arg.assetId] = {
        transactions: accountHistory?.transactions,
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
