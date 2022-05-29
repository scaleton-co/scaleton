import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { Wallet } from './Wallet';
import { walletService } from './WalletService';
import { WalletFeature } from './WalletFeature';

interface WalletState {
  adapterId: string | null;
  features: WalletFeature[];
  session: unknown;
  wallet: Wallet | null;
  isRestoring: boolean;
  isConnecting: boolean;
}

export const restoreSession = createAsyncThunk(
  'wallet/restoreSession',
  async (_, thunkAPI): Promise<[string, unknown, WalletFeature[]]> => {
    const adapterId = localStorage.getItem('wallet:adapter-id');
    const session = localStorage.getItem('wallet:session');

    if (!adapterId || !session) {
      throw new Error('Nothing to restore.');
    }

    (async () => {
      try {
        const wallet = await walletService.awaitReadiness(
          adapterId,
          JSON.parse(session),
        );

        thunkAPI.dispatch(activateWallet(wallet));
      } catch {
        thunkAPI.dispatch(resetSession());
      }
    })();

    const { features } = walletService.getWalletAdapter(adapterId);

    return [
      adapterId,
      JSON.parse(session),
      features,
    ];
  },
);

export const createWalletSession = createAsyncThunk<[unknown, WalletFeature[]], string>(
  'wallet/createSession',
  async (adapterId: string, thunkAPI) => {
    const session = await walletService.createSession(adapterId);

    (async () => {
      try {
        const wallet = await walletService.awaitReadiness(adapterId, session);

        localStorage.setItem('wallet:adapter-id', adapterId);
        localStorage.setItem('wallet:session', JSON.stringify(session));

        thunkAPI.dispatch(activateWallet(wallet));
      } catch (e: any) {
        notification.error({
          message: e.message,
        });

        thunkAPI.dispatch(resetSession());
      }
    })();

    const { features } = walletService.getWalletAdapter(adapterId);

    return [session, features];
  },
);

export const terminateSession = createAsyncThunk(
  'wallet/terminateSession',
  async () => {
    localStorage.removeItem('wallet:adapter-id');
    localStorage.removeItem('wallet:session');
  },
);

const initialState: WalletState = {
  adapterId: null,
  features: [],
  session: null,
  wallet: null,
  isRestoring: false,
  isConnecting: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    activateWallet(state, action: PayloadAction<Wallet>) {
      state.wallet = action.payload;
      state.isConnecting = false;
      state.isRestoring = false;
    },

    resetSession(state) {
      state.adapterId = null;
      state.features = [];
      state.session = null;
      state.wallet = null;
      state.isConnecting = false;
      state.isRestoring = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(createWalletSession.pending, (state, action) => {
      state.isConnecting = true;
    });

    builder.addCase(createWalletSession.fulfilled, (state, action) => {
      const [session, features] = action.payload;

      state.adapterId = action.meta.arg;
      state.session = session;
      state.features = features;
    });

    builder.addCase(restoreSession.pending, (state) => {
      state.isRestoring = true;
    });

    builder.addCase(restoreSession.fulfilled, (state, action) => {
      const [adapterId, session, features] = action.payload;

      state.adapterId = adapterId;
      state.session = session;
      state.features = features;
    });

    builder.addCase(terminateSession.fulfilled, (state) => {
      state.adapterId = null;
      state.features = [];
      state.session = null;
      state.wallet = null;
    });
  },
});

export const { activateWallet, resetSession } = walletSlice.actions;

export default walletSlice.reducer;

