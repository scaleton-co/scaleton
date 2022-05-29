import { AssetType } from './AssetType';

export interface JettonRef {
  id: string;
  type: AssetType.JETTON;
  isCustom?: boolean;
  name: string;
  symbol: string;
  contractAddress: string;
  url?: string;
}
