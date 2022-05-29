import { createAsyncThunk } from '@reduxjs/toolkit';
import { Address } from 'ton';
import { assetCatalog } from '../services';
import type { AssetBalances } from '../types/AssetBalances';

export const refreshBalances = createAsyncThunk(
  'assets/refreshBalances',
  async (owner: string) => {
    const result: AssetBalances = {};

    const ownerAddress = Address.parse(owner);
    const assets = assetCatalog.getAssets();

    await Promise.all(
      assets.map(async (asset) => {
        try {
          const balance = await assetCatalog.getBalance(ownerAddress, asset.id);

          result[asset.id] = {
            balance: balance.toString(),
          };
        } catch (e) {
          console.error(e);
        }
      }),
    );

    return result;
  },
);
