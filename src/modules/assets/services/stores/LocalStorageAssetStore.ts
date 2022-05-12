import { AssetRef } from '../../types/AssetRef';
import { AssetStore } from '../AssetStore';

export class LocalStorageAssetStore implements AssetStore {
  constructor(
    private readonly path: string,
  ) {
  }

  load(): AssetRef[] {
    try {
      return JSON.parse(localStorage.getItem(this.path) ?? '[]');
    } catch {
      return [];
    }
  }

  store(assets: AssetRef[]): void {
    localStorage.setItem(this.path, JSON.stringify(assets));
  }
}
