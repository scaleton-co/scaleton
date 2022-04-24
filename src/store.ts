import { configureStore } from '@reduxjs/toolkit';
import jettons from './modules/jettons/store';
import wallet from './modules/ton-wallet/store';

export const store = configureStore({
  reducer: {
    jettons,
    wallet,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
