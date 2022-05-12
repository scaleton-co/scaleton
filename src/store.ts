import { configureStore } from '@reduxjs/toolkit';
import dex from './modules/dex/store';
import jettons from './modules/jettons/store';
import wallet from './modules/wallet/store';

export const store = configureStore({
  reducer: {
    jettons,
    dex,
    wallet,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
