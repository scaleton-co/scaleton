import { configureStore } from '@reduxjs/toolkit';
import dex from './modules/dapps/dex.swap/store';
import assets from './modules/assets/store';
import wallets from './modules/wallets/store';

export const store = configureStore({
  reducer: {
    assets,
    dex,
    wallets,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
