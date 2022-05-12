import { AssetRef } from '../../assets/types/AssetRef';

export interface PairRef {
  contractAddress: string;
  leftAssetId: string;
  rightAssetId: string;
}
