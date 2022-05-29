import { createAsyncThunk } from '@reduxjs/toolkit';
import { toNano } from 'ton';
import { walletService } from '../../wallets/common/WalletService';
import { assetCatalog } from '../services';
import { AssetType } from '../types';

interface RequestAssetTransferInput<S = unknown> {
  adapterId: string;
  session: S;
  assetId: string;
  recipient: string;
  amount: string;
  comment: string;
}

const ASSET_TRANSFER_TIMEOUT = 2 * 60 * 1000; // 2 minutes

export const requestAssetTransfer = createAsyncThunk<void, RequestAssetTransferInput>(
  'assets/requestAssetTransfer',
  async (input) => {
    const asset = assetCatalog.getAsset(input.assetId);
    const walletAdapter = walletService.getWalletAdapter(input.adapterId);

    switch (asset.type) {
      case AssetType.JETTON:
        return walletAdapter.requestJettonTransfer(
          input.session,
          asset.contractAddress,
          input.recipient,
          toNano(input.amount).toString(),
          input.comment,
          ASSET_TRANSFER_TIMEOUT,
        );

      case AssetType.NATIVE:
        return walletAdapter.requestTransfer(
          input.session,
          input.recipient,
          toNano(input.amount).toString(),
          input.comment,
          ASSET_TRANSFER_TIMEOUT,
        );

      default:
        throw new Error('Asset type is not supported.');
    }
  },
);
