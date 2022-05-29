import { createAsyncThunk } from '@reduxjs/toolkit';
import { assetCatalog } from '../services';
import type { AssetRef } from '../types/AssetRef';

export const hideAsset = createAsyncThunk<AssetRef[], string>(
  'assets/hideAsset',
  async (assetId: string) => {
    assetCatalog.removeAsset(assetId);

    return assetCatalog.getAssets();
  },
);
