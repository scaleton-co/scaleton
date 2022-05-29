import { PairRef } from '../types/Pair';

export class PairCatalog {
  constructor(
    private readonly pairs: PairRef[],
  ) {
  }

  getAll(): PairRef[] {
    return this.pairs;
  }

  getPairsByAsset(assetId: string): PairRef[] {
    return this
      .getAll()
      .filter(pair => pair.leftAssetId === assetId || pair.rightAssetId === assetId);
  }

  getPairByAssets(firstAssetId: string, secondAssetId: string): PairRef | null {
    return this
      .getAll()
      .find(
        pair => (pair.leftAssetId === firstAssetId && pair.rightAssetId === secondAssetId)
          || (pair.leftAssetId === secondAssetId && pair.rightAssetId === firstAssetId)
      ) ?? null;
  }
}
