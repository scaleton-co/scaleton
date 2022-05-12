import { Big } from 'big.js';
import BN from 'bn.js';
import { Address } from 'ton';
import { TradeDirection } from '../../contracts/enums/TradeDirection';
import { AssetStore } from './AssetStore';
import type { TransactionRequest } from '../../wallet/services/TransactionRequest';
import type { AssetRef } from '../types/AssetRef';
import type { JettonRef } from '../types/JettonRef';
import type { Transaction } from '../types/Transaction';
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

  getAll(): AssetRef[] {
    return this.assets;
  }

  getById(assetId: string): AssetRef | null {
    return this.assets.find(asset => asset.id === assetId) ?? null;
  }

  importJetton(jetton: Omit<JettonRef, 'id' | 'type'>) {
    const jettonAddress = Address.parse(jetton.contractAddress);

    this.assetStore.store([
      ...this.assetStore.load(),
      {
        id: `jetton:${jettonAddress.toString()}`,
        type: 'jetton',
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
    const asset = this.getById(assetId);
    const adapter = asset ? this.adapters.get(asset.type) : null;

    if (!asset || !adapter) return new Big(0);

    return adapter.getBalance(ownerAddress, asset);
  }

  async getTransactions(ownerAddress: Address, assetId: string): Promise<Transaction[]> {
    const asset = this.getById(assetId);
    const adapter = asset ? this.adapters.get(asset.type) : null;

    if (!asset || !adapter) return [];

    return adapter.getTransactions(ownerAddress, asset);
  }

  async requestTransaction<S>(
    adapterId: string,
    session: S,
    assetId: string,
    request: TransactionRequest,
  ): Promise<void> {
    const asset = this.getById(assetId);
    const adapter = asset ? this.adapters.get(asset.type) : null;

    if (!asset || !adapter) {
      throw new Error('Asset either does not exist or unsupported.');
    }

    return adapter.requestTransaction(adapterId, session, asset, request);
  }

  async requestSwap<S>(
    adapterId: string,
    session: S,
    assetId: string,
    poolContractAddress: Address,
    tradeDirection: TradeDirection,
    sourceAmountIn: BN | number,
    minimumAmountOut: BN | number,
    queryId: BN | number,
  ): Promise<void> {
    const asset = this.getById(assetId);
    const adapter = asset ? this.adapters.get(asset.type) : null;

    if (!asset || !adapter) {
      throw new Error('Asset either does not exist or unsupported.');
    }

    return adapter.requestSwap(
      adapterId,
      session,
      asset,
      poolContractAddress,
      tradeDirection,
      sourceAmountIn,
      minimumAmountOut,
      queryId,
    );
  }
}
