import { createAsyncThunk } from '@reduxjs/toolkit';
import { assetCatalog } from '../services';
import type { Jetton } from '../../jettons/types/Jetton';
import type { AssetRef } from '../types';

export const importJetton = createAsyncThunk<AssetRef[], Jetton>(
  'assets/importJetton',
  (jetton: Jetton) => {
    assetCatalog.importJetton({
      name: jetton.name,
      symbol: jetton.symbol ?? jetton.name,
      contractAddress: jetton.address,
    });

    return assetCatalog.getAssets();
  },
);
