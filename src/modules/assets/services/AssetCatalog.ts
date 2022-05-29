import { Big } from 'big.js';
import { Address } from 'ton';
import { AssetStore } from './AssetStore';
import { AssetType } from '../types';
import type { AssetRef, JettonRef, Transaction } from '../types';
import type { AssetAdapter } from './AssetAdapter';

export class AssetCatalog {
  private assets: AssetRef[] = [];
  private adapters: Map<AssetRef['type'], AssetAdapter> = new Map();

  constructor(
    private readonly assetStore: AssetStore,
    private readonly standardAssets: AssetRef[],
  ) {
    this.reload();
  }

  registerAdapter(type: AssetRef['type'], adapter: AssetAdapter) {
    this.adapters.set(type, adapter);
  }

  reload() {
    this.assets = [
      ...this.standardAssets,
      ...this.assetStore.load().map(asset => ({
        ...asset,
        isCustom: true,
      })),
    ];
  }

  getAssets(): AssetRef[] {
    return this.assets;
  }

  getAsset(assetId: string): AssetRef {
    const asset = this.assets.find(asset => asset.id === assetId);

    if (!asset) {
      throw new Error('Asset is not registered.');
    }

    return asset;
  }

  importJetton(jetton: Omit<JettonRef, 'id' | 'type'>) {
    const jettonAddress = Address.parse(jetton.contractAddress);

    this.assetStore.store([
      ...this.assetStore.load(),
      {
        id: `jetton:${jettonAddress.toString()}`,
        type: AssetType.JETTON,
        ...jetton,
      },
    ]);

    this.reload();
  }

  removeAsset(assetId: string): void {
    this.assetStore.store(
      this.assetStore
        .load()
        .filter(asset => asset.id !== assetId),
    );

    this.reload();
  }

  async getBalance(ownerAddress: Address, assetId: string): Promise<Big> {
    const asset = this.getAsset(assetId);
    const adapter = this.getAdapter(asset.type);

    return adapter.getBalance(ownerAddress, asset);
  }

  async getTransactions(ownerAddress: Address, assetId: string): Promise<Transaction[]> {
    const asset = this.getAsset(assetId);
    const adapter = this.getAdapter(asset.type);

    return adapter.getTransactions(ownerAddress, asset);
  }

  private getAdapter(assetType: AssetType): AssetAdapter {
    const adapter = this.adapters.get(assetType);

    if (!adapter) {
      throw new Error('Adapter is not registered.');
    }

    return adapter;
  }
}
