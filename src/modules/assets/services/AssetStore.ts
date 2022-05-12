import { AssetRef } from '../types/AssetRef';

export interface AssetStore {
  load(): AssetRef[];
  store(assets: AssetRef[]): void;
}
