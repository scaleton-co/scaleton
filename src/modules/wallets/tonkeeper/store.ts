import { createSlice } from '@reduxjs/toolkit';
import { requestTransfer } from './actions/requestTransfer';

interface TonkeeperState {
  transfer: {
    status: 'inactive' | 'pending' | 'timeout' | 'confirmed';
    deeplink: string | null;
  };
}

const initialState: TonkeeperState = {
  transfer: {
    status: 'inactive',
    deeplink: null,
  },
};

const tonkeeperSlice = createSlice({
  name: 'tonkeeper',
  initialState,
  reducers: {
    cancelTransfer(state) {
      state.transfer.status = 'inactive';
      state.transfer.deeplink = null;
    },
  },
  extraReducers(builder) {
    builder.addCase(requestTransfer.fulfilled, (state, action) => {
      state.transfer.status = 'pending';
      state.transfer.deeplink = action.meta.arg.deeplink;
    });
  },
});

export const { cancelTransfer } = tonkeeperSlice.actions;

export default tonkeeperSlice.reducer;
