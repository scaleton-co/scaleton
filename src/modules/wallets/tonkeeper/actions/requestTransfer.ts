import { createAsyncThunk } from '@reduxjs/toolkit';

interface RequestTransferPayload {
  destination: string;
  amount: string;
  comment: string;
  deeplink: string;
}

export const requestTransfer = createAsyncThunk(
  'tonkeeper/requestTransfer',
  async (payload: RequestTransferPayload) => {
    //
  },
);
