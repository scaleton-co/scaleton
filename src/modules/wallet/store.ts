import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notification } from 'antd';
import { Wallet } from './services/Wallet';
import { walletService } from './services/WalletService';

interface WalletState {
  adapterId: string | null;
  session: unknown;
  wallet: Wallet | null;
  isRestoring: boolean;
  isConnecting: boolean;
}

export const restoreSession = createAsyncThunk(
  'wallet/restoreSession',
  async (_, thunkAPI): Promise<[string, unknown]> => {
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

    return [
      adapterId,
      JSON.parse(session),
    ];
  },
);

export const createWalletSession = createAsyncThunk(
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

    return session;
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
      state.adapterId = action.meta.arg;
      state.session = action.payload;
    });

    builder.addCase(restoreSession.pending, (state) => {
      state.isRestoring = true;
    });

    builder.addCase(restoreSession.fulfilled, (state, action) => {
      const [adapterId, session] = action.payload;

      state.adapterId = adapterId;
      state.session = session;
    });

    builder.addCase(terminateSession.fulfilled, (state) => {
      state.adapterId = null;
      state.session = null;
      state.wallet = null;
    });
  },
});

export const { activateWallet, resetSession } = walletSlice.actions;

export default walletSlice.reducer;

