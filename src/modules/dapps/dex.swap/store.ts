import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import BN from 'bn.js';
import { Address, toNano } from 'ton';
import { assetCatalog, tonClient } from '../../assets/services';
import { PoolContract } from '../../contracts/PoolContract';
import { TradeDirection } from '../../contracts/enums/TradeDirection';
import { SwapStatus } from './enums/SwapStatus';
import { pairCatalog, tradeService } from './services';
import { generateQueryId } from './utils/generateQueryId';
import { wait } from './utils/wait';
import type { RootState } from '../../../store';
import { selectWalletAddress } from '../../wallets/common/selectors/selectWalletAddress';

const DEFAULT_SLIPPAGE = 3;

interface SwapState {
  swap: {
    sourceId: string;
    sourceAmountIn: string;
    sourceBalance: string;
    sourceBalanceLoading: boolean;

    destinationId: string;
    destinationBalance: string;
    destinationBalanceLoading: boolean;
    destinationAmountOut: string;

    slippage: number;

    currentPrice: string;
    currentPriceLoading: boolean;

    status: SwapStatus;
    receivedAmount: string;
  };
}

const initialState: SwapState = {
  swap: {
    sourceId: '',
    sourceBalance: '-',
    sourceBalanceLoading: false,
    sourceAmountIn: '0',

    destinationId: '',
    destinationBalance: '-',
    destinationBalanceLoading: false,
    destinationAmountOut: '0',

    slippage: DEFAULT_SLIPPAGE,

    currentPrice: '',
    currentPriceLoading: false,

    status: SwapStatus.IDLE,
    receivedAmount: '',
  },
};

export const refreshBalances = createAsyncThunk<[string, string], void>(
  'swap/refreshBalances',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const owner = Address.parse(selectWalletAddress(state)!);
    const { sourceId, destinationId } = state.dex.swap;

    const [sourceBalance, destinationBalance] = await Promise.all([
      sourceId ? assetCatalog.getBalance(owner, sourceId) : Promise.resolve(null),
      destinationId ? assetCatalog.getBalance(owner, destinationId) : Promise.resolve(null),
    ]);

    return [
      sourceBalance?.toString() ?? '-',
      destinationBalance?.toString() ?? '-',
    ];
  },
);

export const refreshPrices = createAsyncThunk<string, void>(
  'swap/refreshPrices',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { sourceId, destinationId } = state.dex.swap;

    const pair = pairCatalog.getPairByAssets(sourceId, destinationId)!;
    const contractAddress = Address.parse(pair.contractAddress);
    const poolContract = new PoolContract(tonClient, null as any, contractAddress);

    const prices = await poolContract.getTokenPrices();

    return pair.leftAssetId === destinationId
      ? prices.leftTokenPrice.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
      : prices.rightTokenPrice.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  },
);

export const estimateSwap = createAsyncThunk(
  'swap/estimateSwap',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const { sourceId, sourceAmountIn, destinationId } = state.dex.swap;

    if (!sourceId || !sourceAmountIn || !destinationId) {
      throw new Error('Options are not chosen yet.');
    }

    const pair = pairCatalog.getPairByAssets(sourceId, destinationId)!;
    const contractAddress = Address.parse(pair.contractAddress);
    const poolContract = new PoolContract(tonClient, null as any, contractAddress);

    const amountOut = await poolContract.estimateSwap(
      toNano(sourceAmountIn),
      pair.leftAssetId === sourceId ? TradeDirection.A_TO_B : TradeDirection.B_TO_A,
    );

    return amountOut.toString();
  },
);

export const requestSwap = createAsyncThunk(
  'swap/swap',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const { adapterId, session, wallet } = state.wallets.common;
    const { sourceId, destinationId, sourceAmountIn } = state.dex.swap;

    if (!adapterId || !wallet) {
      throw new Error('Wallet is not connected.');
    }

    const walletAddress = Address.parse(wallet.address);

    const pair = pairCatalog.getPairByAssets(sourceId, destinationId)!;
    const tradeDirection = pair.leftAssetId === sourceId ? TradeDirection.A_TO_B : TradeDirection.B_TO_A;

    const minimumAmountOut = 0;
    const queryId = generateQueryId();

    await thunkAPI.dispatch(markConfirming());

    try {
      const sourceAsset = assetCatalog.getAsset(sourceId);

      await tradeService.requestSwap(
        adapterId,
        session,
        sourceAsset,
        Address.parse(pair.contractAddress),
        tradeDirection,
        toNano(sourceAmountIn),
        toNano(minimumAmountOut),
        queryId,
      );
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      throw error;
    }

    await thunkAPI.dispatch(markConfirmed());

    await wait(
      async () => {
        const transactions = await assetCatalog.getTransactions(walletAddress, sourceId);

        return transactions.find(transaction => {
          try {
            if (transaction.operation !== 'out') return false;
            if (!transaction.comment?.startsWith('swp#')) return false;

            return queryId.eq(new BN(transaction.comment.substring(4, 20), 'hex'));
          } catch {
            return false;
          }
        }) ?? null;
      },
      3_000,
    );

    await thunkAPI.dispatch(markSent());

    // wait from income transaction
    const incomeTransaction = await wait(
      async () => {
        const transactions = await assetCatalog.getTransactions(walletAddress, destinationId);

        return transactions.find(transaction => {
          if (transaction.operation !== 'in') return false;
          if (transaction.queryId.eq(queryId)) return true;

          const { body } = transaction;

          return body && body.length > 4 && new BN(body.slice(4).toString('hex'), 'hex').eq(queryId);
        }) ?? null;
      },
      3_000,
    );

    await thunkAPI.dispatch(
      markReceived(incomeTransaction.amount.toString()),
    );
  },
);

const DEFAULT_SOURCE_ID = 'ton';
const DEFAULT_PAIR = pairCatalog.getPairsByAsset(DEFAULT_SOURCE_ID)[0];
const DEFAULT_DESTINATION_ID = DEFAULT_PAIR?.leftAssetId !== DEFAULT_SOURCE_ID
  ? DEFAULT_PAIR?.leftAssetId
  : DEFAULT_PAIR?.rightAssetId;

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    reset(state) {
      state.swap.sourceId = DEFAULT_SOURCE_ID;
      state.swap.sourceAmountIn = '0';
      state.swap.destinationId = DEFAULT_DESTINATION_ID;
      state.swap.destinationAmountOut = ''
      state.swap.currentPrice = '';
      state.swap.currentPriceLoading = false;
      state.swap.status = SwapStatus.IDLE;
      state.swap.receivedAmount = '';
    },

    setSourceAmount(state, action: PayloadAction<string>) {
      state.swap.sourceAmountIn = action.payload;
    },

    setSource(state, action: PayloadAction<string>) {
      state.swap.sourceId = action.payload;
    },

    setDestination(state, action: PayloadAction<string>) {
      state.swap.destinationId = action.payload;
    },

    markConfirming(state) {
      state.swap.status = SwapStatus.CONFIRMING;
    },

    markConfirmed(state) {
      state.swap.status = SwapStatus.CONFIRMED;
    },

    markConfirmFailed(state) {
      state.swap.status = SwapStatus.CONFIRM_FAILED;
    },

    markSent(state) {
      state.swap.status = SwapStatus.SENT;
    },

    markReceived(state, action: PayloadAction<string>) {
      state.swap.status = SwapStatus.RECEIVED;
      state.swap.receivedAmount = action.payload;
    },

    cancelSwap(state) {
      state.swap.status = SwapStatus.IDLE;
      state.swap.receivedAmount = '';
    },

    reverseTradeDirection(state) {
      const {
        sourceId,
        sourceBalance,
        destinationId,
        destinationBalance,
      } = state.swap;

      state.swap.sourceId = destinationId;
      state.swap.sourceBalance = destinationBalance;
      state.swap.destinationId = sourceId;
      state.swap.destinationBalance = sourceBalance;
      state.swap.currentPrice = '';
    }
  },
  extraReducers(builder) {
    builder.addCase(requestSwap.pending, (state) => {
      //
    });

    builder.addCase(requestSwap.fulfilled, (state) => {
      //
    });

    builder.addCase(requestSwap.rejected, (state) => {
      //
    });

    builder.addCase(refreshBalances.fulfilled, (state, action) => {
      const [sourceBalance, destinationBalance] = action.payload;

      state.swap.sourceBalance = sourceBalance;
      state.swap.destinationBalance = destinationBalance;
    });

    builder.addCase(refreshPrices.pending, (state, action) => {
      state.swap.currentPriceLoading = true;
    });

    builder.addCase(refreshPrices.fulfilled, (state, action) => {
      state.swap.currentPriceLoading = false;
      state.swap.currentPrice = action.payload;
    });

    builder.addCase(refreshPrices.rejected, (state, action) => {
      state.swap.currentPriceLoading = false;
    });

    builder.addCase(estimateSwap.pending, (state, action) => {
      state.swap.destinationAmountOut = '';
    });

    builder.addCase(estimateSwap.fulfilled, (state, action) => {
      state.swap.destinationAmountOut = action.payload;
    });

    builder.addCase(estimateSwap.rejected, (state, action) => {
      state.swap.destinationAmountOut = '';
    });
  },
});

export const {
  reset,
  setSourceAmount,
  setSource,
  setDestination,
  markConfirming,
  markConfirmed,
  markSent,
  markReceived,
  cancelSwap,
  reverseTradeDirection,
} = swapSlice.actions;

export default swapSlice.reducer;
