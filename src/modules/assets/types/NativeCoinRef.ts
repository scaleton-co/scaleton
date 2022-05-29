import { AssetType } from './AssetType';

export interface NativeCoinRef {
  id: string;
  type: AssetType.NATIVE;
  isCustom: boolean;
  name: string;
  symbol: string;
  url: string;
}
