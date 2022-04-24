import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TON_WALLET_EXTENSION_URL, tonWalletClient } from './services/tonWalletClient';
import type { Wallet } from './types/Wallet';

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  wallets: Wallet[];
}

const initialState: WalletState = {
  isConnected: false,
  isConnecting: localStorage.getItem('wallet:connected') === 'true',
  wallets: [],
};

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const initializeWallet = createAsyncThunk<Wallet[], void>(
  'wallet/initialize',
  async () => {
    if (localStorage.getItem('wallet:connected') !== 'true') {
      return [];
    }

    // Application may get initialized earlier than TON Wallet.
    await tonWalletClient.ready();

    const [wallets] = await Promise.all([
      tonWalletClient.requestWallets(),
      delay(300),
    ]);

    return wallets;
  },
)

export const connectWallet = createAsyncThunk(
  'connectWallet',
  async () => {
    if (!tonWalletClient.isAvailable) {
      window.open(TON_WALLET_EXTENSION_URL, '_blank');
      return Promise.reject('Ton Wallet is not available.');
    }

    const [wallets] = await Promise.all([
      tonWalletClient.requestWallets(),
      delay(300),
    ]);

    if (wallets.length) {
      localStorage.setItem('wallet:connected', 'true');
    }

    return wallets;
  },
);

export const disconnectWallet = createAsyncThunk(
  'disconnectWallet',
  () => {
    localStorage.removeItem('wallet:connected');
  },
);

const store = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(initializeWallet.fulfilled, (state, action) => {
      state.isConnecting = false;
      state.isConnected = true;
      state.wallets = action.payload;
    });

    builder.addCase(connectWallet.pending, (state, action) => {
      state.isConnecting = true;
    });

    builder.addCase(connectWallet.fulfilled, (state, action) => {
      state.isConnecting = false;
      state.isConnected = true;
      state.wallets = action.payload;
    });

    builder.addCase(connectWallet.rejected, (state, action) => {
      state.isConnecting = false;
      state.isConnected = false;
    });

    builder.addCase(disconnectWallet.fulfilled, (state, action) => {
      state.isConnecting = false;
      state.isConnected = false;
      state.wallets = [];
    });
  },
});

export default store.reducer;
