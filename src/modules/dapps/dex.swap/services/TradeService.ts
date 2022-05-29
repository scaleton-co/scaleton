import BN from 'bn.js';
import { Address, TonClient } from 'ton';
import { TradeDirection } from '../../../contracts/enums/TradeDirection';
import { PoolContract } from '../../../contracts/PoolContract';
import { WalletService } from '../../../wallets/common/WalletService';
import { AssetCatalog } from '../../../assets/services/AssetCatalog';
import type { AssetRef } from '../../../assets/types';
import { AssetType } from '../../../assets/types';

const TRADE_GAS_FEES = 0.15;
const FORWARD_FEES = 0.11;

export class TradeService {
  constructor(
    private readonly tonClient: TonClient,
    private readonly assetCatalog: AssetCatalog,
    private readonly walletService: WalletService,
  ) {
  }

  async requestSwap<S>(
    adapterId: string,
    session: S,
    asset: AssetRef,
    poolContractAddress: Address,
    tradeDirection: TradeDirection,
    sourceAmountIn: BN | number,
    minimumAmountOut: BN | number,
    queryId: BN | number,
  ): Promise<void> {
    const poolContract = new PoolContract(this.tonClient, null as any, poolContractAddress);
    const swapRequestText = poolContract.createSwapRequestText(tradeDirection, minimumAmountOut, queryId);
    const wallet = this.walletService.getWalletAdapter(adapterId);

    switch (asset.type) {
      case AssetType.NATIVE:
        return wallet.requestTransfer(
          session,
          poolContract.address.toFriendly(),
          sourceAmountIn.toString(10),
          swapRequestText,
          2 * 60 * 1000,
        );

      case AssetType.JETTON:
        return wallet.requestJettonTransfer(
          session,
          asset.contractAddress,
          poolContract.address.toFriendly(),
          sourceAmountIn.toString(10),
          swapRequestText,
          2 * 60 * 1000,
          FORWARD_FEES,
          TRADE_GAS_FEES,
        );

      default:
        throw new Error('Swap operation with this asset type is not supported.');
    }
  }
}
